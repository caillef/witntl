// Global variables to stock informations (mostly for debug)
var stations;
var trains;

// Get station from stationShortCode
var getStation = (stationShortCode) => stations.find(s => s.stationShortCode === stationShortCode);
// Get hour with format HH:MM
var getHourFromDate = date => `${("00" + date.getHours()).slice(-2)}:${("00" + date.getMinutes()).slice(-2)}`;

// Get the actual/scheduled time for a specific station in a time table
function getDepartureInList(timetable, stationShortCode) {
    var train = timetable.filter(s => s.stationShortCode === stationShortCode && s.type === 'DEPARTURE')[0];
    // Departure_date is undefined if the station is the terminus of the line
    return (train && (train.actualTime || train.scheduledTime) || undefined);
}

// Format the timeTableRows inside of the API response
function formatRawTrain(t) {
    var departure_date = getDepartureInList(t.timeTableRows, this.station.stationShortCode);
    var train = {
        terminus: t.timeTableRows[t.timeTableRows.length - 1],
        line: t.commuterLineID || "VR",
        station: this.station
    };
    // Clear train that are the last stations of the list
    if (departure_date === undefined || train.terminus.stationShortCode === train.station.stationShortCode)
        return undefined;
    train.departure_date = new Date(departure_date);
    // Remove train that left before the actual hour
    if (train.departure_date < new Date())
        return undefined;
    return train;
}

// Show trains list
function showTrainsAtStation(station) {
    // Place a market at the station position
    LeafletMap.PlaceMarker(station.latitude, station.longitude, station.stationName);

    var list = document.getElementById('trainsList');
    // Get all the trains that are passing by a specified station
    TrafficAPI.GetTrainsAtStation(station.stationShortCode)
        .then(res => {
            // Parse the text into JSON
            trains = JSON.parse(res);

            // If there is no train, show a message
            if (trains.length === 0) {
                list.innerHTML = `<h2>No train leaving ${station.stationName} today<h2>`;
                list.classList += " list-title";
                return;
            }
            // Show the name of the station
            list.innerHTML = `<h2>Leaving ${station.stationName} today at :<h2>`;
            list.classList += " list-title";

            // For each train, format, filter the undefined and sort them by hour
            trains = trains
                .map(formatRawTrain, {
                    station: station
                })
                .filter(t => t !== undefined) // Remove undefined train (for example if there is no departure if this is the terminus)
                .sort((a,b) => a.departure_date - b.departure_date)
                .slice(0, 16);
            
            // Create UI element for each train
            trains.forEach(t => {
                var text = document.createElement('p');
                text.innerHTML = `<b> ${getHourFromDate(t.departure_date)} </b> (in ${Math.floor((t.departure_date - new Date())/60000)}min) | ${t.line} train going to ${getStation(t.terminus.stationShortCode).stationName}`;
                text.onclick = () => {
                    // When clicked, show the terminus and rescale the map
                    this.classList += " selected-element";
                    var station = getStation(t.terminus.stationShortCode);
                    LeafletMap.PlaceTerminus(station.latitude, station.longitude, station.stationName);
                }
                text.classList += " list-element";
                // Add the text element in the list element
                list.appendChild(text);
            });
        })
        .catch(err => console.log("Error: " + err))    
}

function showStationsList() {
    // If stations are undefined, try to call again this function in a second
    if (stations === undefined) {
        setTimeout(showStationsList, 1000)
        return;
    }
    var list = document.getElementById('stationsList');
    list.onchange = function() {
        var index = this.selectedIndex;
        showTrainsAtStation(stations[index]);
    }
    stations.forEach(s => {
        var option = document.createElement('option');
        option.innerHTML = s.stationName + " " + s.stationShortCode;
        list.appendChild(option);
    });

    // Show Leppävaara station by default
    var lpvIndex = stations.findIndex(s => s.stationShortCode=== 'HKI');
    showTrainsAtStation(stations[lpvIndex]);
    list.selectedIndex = lpvIndex;
}

// Initialize map
LeafletMap.InitializeMap();

TrafficAPI.GetStationsList()
    .then(res => {
        stations = JSON.parse(res);
    })
    .catch(err => console.log("Error: " + err))

showStationsList();

// Ask for the location and find the nearest station
function selectNearestStation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            console.log(pos.coords.latitude + " " + pos.coords.longitude);
            var nearest = {
                id: 0,
                station: undefined,
                sqrDist: -1
            }
            for (var stationId in stations) {
                var station = stations[stationId];
                // Calculate the square distance
                var sqrDist = Math.pow(parseFloat(pos.coords.latitude) - station.latitude, 2) + Math.pow(parseFloat(pos.coords.longitude) - station.longitude, 2);
                if (nearest.sqrDist === -1 || nearest.sqrDist > sqrDist) {
                    nearest = {
                        id: stationId,
                        station: station,
                        sqrDist: sqrDist
                    };
                }
            }
            // if a station is found, select it
            if (nearest.station !== undefined) {
                showTrainsAtStation(nearest.station);
                document.getElementById('stationsList').selectedIndex = nearest.id;
            }
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
