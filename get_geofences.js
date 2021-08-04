getGeofences();

async function getGeofences() {
    const response = await fetch('/geofence');
    const data = await response.json();

    addGeofences(data);
}

function addGeofences(data) {
    var jsonFeatures = [];

    data.forEach(function (geof) {
        var geometry = JSON.parse(geof.geometry);

        var feature = {
            type: 'Feature',
            properties: {
                name: geof.name,
            },
            geometry: geometry,
        };

        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    L.geoJson(geoJson).addTo(mymap);
}