var sorted = Object.entries(window.attivazioniGeofence).sort(([, a], [, b]) => a.attivazioni - b.attivazioni)
var rangeArray = split(0, sorted[sorted.length - 1][1].attivazioni, 6);

console.log(rangeArray);

function split(left, right, parts) {
    var result = [],
        delta = (right - left) / (parts - 1);
    while (left < right) {
        result.push(left);
        left += delta;
    }
    result.push(right);
    return result;
}


getGeofences();

async function getGeofences() {
    const response = await fetch('/geofence');
    const data = await response.json();

    await addGeofences(data);
}

async function addGeofences(data) {
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

    L.geoJson(geoJson, {
        style: geofenceStyle,
    }).addTo(mymap);

    function getColorGeofences(d) {
        return d >= rangeArray[5] ? '#00a100' :
            d >= rangeArray[4] ? '#47b64c' :
                d >= rangeArray[3] ? '#6ecb7f' :
                    d >= rangeArray[2] ? '#93dfb0' :
                        d >= rangeArray[1] ? '#bdf2dd' :
                            d >= rangeArray[0] ? '#ffffff' :
                                '#000000';
    }


    function geofenceStyle(feature) {
        return {
            fillColor: getColorGeofences(window.attivazioniGeofence[feature.properties.name].attivazioni),
            weight: 3,
            opacity: 1,
            color: '#008080',
            fillOpacity: 0.7
        };
    }

    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = rangeArray,
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        div.innerHTML = '<p>Attivazioni geofence normali</p>';
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorGeofences(grades[i] + 1) + '"></i> ' +
                grades[i].toFixed(2) + (grades[i + 1] ? '&ndash;' + grades[i + 1].toFixed(2) + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);
}