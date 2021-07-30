getGeofencesVietate();

async function getGeofencesVietate() {
    const response = await fetch('/geofenceVietate');
    const data = await response.json();

    addGeofencesVietate(data);
}

function addGeofencesVietate(data) {

    var jsonFeatures = [];

    data.forEach(function (geofVietate) {
        var geometry = JSON.parse(geofVietate.geometry);

        var feature = {
            type: 'Feature',
            properties: {
                name: geofVietate.name,
            },
            geometry: geometry,
            color: 'red'
        };

        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    L.geoJson(geoJson, {
        style: {color: 'red'}
    }).addTo(mymap);
}