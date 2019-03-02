// Interface for the Digitraffic REST API 

var URL_GET_ALL_STATIONS_METADATA = 'https://rata.digitraffic.fi/api/v1/metadata/stations';
var URL_GET_TRAINS_FOR_STATION = 'https://rata.digitraffic.fi/api/v1/live-trains/station';

var LIMIT_TRAIN = 100;

// using the last functionnalities of Javascript : Promises
function XhrRequest(verb, url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(verb, url, true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    })
}

// API calls
var TrafficAPI = {
    GetStationsList: () => XhrRequest('GET', URL_GET_ALL_STATIONS_METADATA),
    GetTrainsAtStation: (stationId) => XhrRequest('GET', `${URL_GET_TRAINS_FOR_STATION}/${stationId}?include_nonstopping=false&departing_trains=${LIMIT_TRAIN}`)
}