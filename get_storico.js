getStorico();

async function getStorico() {
    const response = await fetch('/storico');
    const data = await response.json();

    addStorico(data);
}

function addStorico(data) {
    var jsonFeatures = [];

    data.forEach(function (lineString) {
        var geometry = JSON.parse(lineString.geometry);

        var feature = {
            type: 'Feature',
            geometry: {
                type: geometry.type,
                coordinates: geometry.coordinates
            },
        };
        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    window.layerStorico = L.geoJson(geoJson);
    window.layerStorico.addTo(mymap);

    abilitaPulsanti();
}