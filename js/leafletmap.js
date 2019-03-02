// Interface for the LeafletMap API

var LeafletMap = {
    // Initialize the map with the location of Helsinki
    map: L.map('map').setView([60.172097, 24.941249], 13),
    markerPos: {latitude: 0, longitude: 0},

    // Show the map
    InitializeMap: () => {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(LeafletMap.map);
    },

    // Place a marker at a specified location
    PlaceMarker: (latitude, longitude, stationName) => {
        // Remove the previous marker if it exists
        if (LeafletMap.marker !== undefined)
            LeafletMap.map.removeLayer(LeafletMap.marker);
        if (LeafletMap.terminus !== undefined) {
            LeafletMap.map.removeLayer(LeafletMap.terminus);
            LeafletMap.terminus = undefined;
        }
        
        LeafletMap.markerPos = { latitude, longitude };
        // Add the marker on the map
        LeafletMap.marker = L.marker([latitude, longitude]).addTo(LeafletMap.map);
        LeafletMap.marker.bindPopup(stationName).openPopup(); 
        
        // Move the map to the specified location
        LeafletMap.map.panTo([latitude, longitude]);
    },

    // Place a marker at a specified location
    PlaceTerminus: (latitude, longitude, stationName) => {
        // Remove the previous marker if it exists
        if (LeafletMap.terminus !== undefined)
            LeafletMap.map.removeLayer(LeafletMap.terminus);
        
        // Add the marker on the map
        LeafletMap.terminus = L.marker([latitude, longitude]).addTo(LeafletMap.map);
        
        // Move the map to the specified location
        LeafletMap.map.panTo([(latitude + LeafletMap.markerPos.latitude) / 2, (longitude + LeafletMap.markerPos.longitude) / 2]);

        // Auto zoom
        var group = new L.featureGroup([LeafletMap.terminus, LeafletMap.marker]);
        LeafletMap.map.fitBounds(group.getBounds());
    }    
}