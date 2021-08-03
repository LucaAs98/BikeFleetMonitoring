getRastrelliere();

async function getRastrelliere() {
    const response = await fetch('/rastrelliere');
    const data = await response.json();

    addMarkers(data);
}

function addMarkers(data) {
    var markers = L.markerClusterGroup();

    var jsonFeatures = [];

    data.forEach(function (point) {
        var lat = point.lat;
        var lon = point.long;
        var name = point.name;

        var feature = {
            type: 'Feature',
            properties: {
                lat: lat,
                lon: lon,
                name: name,
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            },
        };

        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    //L.geoJson(geoJson).addTo(mymap);

    L.geoJson(geoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: onEachFeature
    });

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.name) {
            jsonFeatures.push(feature.geometry.coordinates);
            layer.bindTooltip(feature.properties.name, {maxHeight: 250});
            markers.addLayer(layer);
        }
    }

    L.layerGroup([markers]).addTo(mymap);
}