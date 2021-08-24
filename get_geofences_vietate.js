getGeofencesVietate();

async function getGeofencesVietate() {
    const response = await fetch('/geofenceVietate');
    window.geofenceVietateData = await response.json();

    await addGeofencesVietate(window.geofenceVietateData);
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

    window.geofenceVietate = L.geoJson(geoJson, {
        style: geofenceStyle,
    }).addTo(mymap);

    function getColorGeofences(d) {
        return d >= rangeArrayVietato[5] ? '#b90000' :
            d >= rangeArrayVietato[4] ? '#d2413d' :
                d >= rangeArrayVietato[3] ? '#e76a72' :
                    d >= rangeArrayVietato[2] ? '#f692a6' :
                        d >= rangeArrayVietato[1] ? '#febad7' :
                            d >= rangeArrayVietato[0] ? '#ffe4ff' :
                                '#000000';
    }

    function geofenceStyle(feature) {
        if (vediAttivazioni) {
            return {
                fillColor: getColorGeofences(window.attivazioniGeofence[feature.properties.name].attivazioni),
                weight: 3,
                opacity: 1,
                color: '#610000',
                fillOpacity: 0.7
            };
        } else {
            return {
                fillColor: 'red',
                weight: 3,
                opacity: 1,
                color: '#610000',
                fillOpacity: 0.6
            };
        }

    }

    //Se dobbiamo visualizzare le attivazioni aggiungiamo anche la legenda alla mappa
    if (vediAttivazioni) {
        window.legendGeofenceVietate = L.control({position: 'bottomleft'});

        window.legendGeofenceVietate.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = rangeArrayVietato,
                labels = [];

            div.innerHTML = '<p>Attivazioni geofence vietate:</p>'


            for (let i in grades) {
                if (Math.trunc(grades[i]) - grades[i] < 0) {
                    grades[i] = Math.trunc(grades[i]) + 1;
                }
            }

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorGeofences(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' +');
            }
            return div;
        };

        window.legendGeofenceVietate.addTo(mymap);
    }
}