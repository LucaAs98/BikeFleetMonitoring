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

getGeofencesVietate();

async function getGeofencesVietate() {
    const response = await fetch('/geofenceVietate');
    const data = await response.json();

    await addGeofencesVietate(data);
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
        style: geofenceStyle,
    }).addTo(mymap);

    function getColorGeofences(d) {
        return d >= rangeArray[5] ? '#b90000' :
            d >= rangeArray[4] ? '#d2413d' :
                d >= rangeArray[3] ? '#e76a72' :
                    d >= rangeArray[2] ? '#f692a6' :
                        d >= rangeArray[1] ? '#febad7' :
                            d >= rangeArray[0] ?  '#ffe4ff' :
                                '#000000';
    }
    function geofenceStyle(feature) {
        return {
            fillColor: getColorGeofences(window.attivazioniGeofence[feature.properties.name].attivazioni),
            weight: 3,
            opacity: 1,
            color: '#610000',
            fillOpacity: 0.7
        };
    }

    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = rangeArray,
            labels = [];

        div.innerHTML = '<p>Attivazioni geofence vietate:</p>'
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorGeofences(grades[i] + 1) + '"></i> ' +
                grades[i].toFixed(2) + (grades[i + 1] ? '&ndash;' + grades[i + 1].toFixed(2) + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);
}