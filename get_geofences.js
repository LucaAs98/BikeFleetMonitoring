getGeofences();

async function getGeofences() {
    const response = await fetch('/geofence');
    window.geofenceData = await response.json();

    await addGeofences(window.geofenceData);
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

    window.geofence = L.geoJson(geoJson, {
        style: geofenceStyle,
    }).addTo(mymap);

    function getColorGeofences(d) {
        return d >= rangeArrayNormale[5] ? '#00a100' :
            d >= rangeArrayNormale[4] ? '#47b64c' :
                d >= rangeArrayNormale[3] ? '#6ecb7f' :
                    d >= rangeArrayNormale[2] ? '#93dfb0' :
                        d >= rangeArrayNormale[1] ? '#bdf2dd' :
                            d >= rangeArrayNormale[0] ? '#ffffff' :
                                '#000000';
    }


    function geofenceStyle(feature) {
        if (vediAttivazioni) {
            return {
                fillColor: getColorGeofences(window.attivazioniGeofence[feature.properties.name].attivazioni),
                weight: 3,
                opacity: 1,
                color: '#005e00',
                fillOpacity: 0.7
            };
        } else {
            return {
                fillColor: 'green',
                weight: 3,
                opacity: 1,
                color: '#005e00',
                fillOpacity: 0.6
            };
        }
    }

    //Se dobbiamo visualizzare le attivazioni aggiungiamo anche la legenda alla mappa
    if (vediAttivazioni) {
        window.legendGeofence = L.control({position: 'bottomleft'});

        window.legendGeofence.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = rangeArrayNormale;

            for (let i in grades) {
                if (Math.trunc(grades[i]) - grades[i] < 0) {
                    grades[i] = Math.trunc(grades[i]) + 1;
                }
            }

            div.innerHTML = '<p>Attivazioni geofence normali</p>';
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorGeofences(grades[i]) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? ' &ndash; ' + (grades[i + 1] - 1) + '<br>' : '');
            }
            return div;
        };

        window.legendGeofence.addTo(mymap);
    }
}