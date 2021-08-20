getIntensitaAttivazioni();

async function getIntensitaAttivazioni() {
    vediAttivazioni = true;
    const response = await fetch('/storico');
    const data = await response.json();

    await addIntensitaAttivazioni(data);
}

async function addIntensitaAttivazioni(data) {
    /* Prendiamo le geofence normali e creiamo un oggetto che le contenga, ci servirà per calcolare il numero
     * di attivazioni. */
    window.attivazioniGeofence = {};

    for (const key of window.geofenceData) {
        window.attivazioniGeofence[key.name] = {
            attivazioni: 0,
            vietata: 'False',
        };
    }

    //Prendiamo le geofence vietate e aggiungiamole al nostro oggetto
    for (const key of window.geofenceVietateData) {
        window.attivazioniGeofence[key.name] = {
            attivazioni: 0,
            vietata: 'True',
        };
    }

    //Provare a velocizzare il tutto, questo fa rallentare la visualizzazione
    for (const lineString of data) {
        var geometry = JSON.parse(lineString.geometry);
        var geofenceIntersecate = [];
        var prevGeof = [];       //Geofence intersecata in precedenza
        for (var point of geometry.coordinates) {


            var coordinates = {
                lng: point[0],
                lat: point[1],
            };

            const geofenceIntersecateResponse = await fetch('/intersezione_geofence?lat=' + coordinates.lat + '&lng=' + coordinates.lng, {
                method: 'GET',
            });

            geofenceIntersecate = await geofenceIntersecateResponse.json();

            for (let geof of geofenceIntersecate) {
                if (!prevGeof.includes(geof.name)) {
                    window.attivazioniGeofence[geof.name].attivazioni += 1;
                    prevGeof.push(geof.name);
                }
            }
            prevGeof = [];

            for (let geof of geofenceIntersecate) {
                prevGeof.push(geof.name);
            }
        }
    }

    mymap.removeLayer(window.geofence);
    mymap.removeLayer(window.geofenceVietate);

    let max = Math.max.apply(null, Object.values(window.attivazioniGeofence).map(item => item.attivazioni));
    window.rangeArray = split(0, max, 6);

    $.getScript("./get_geofences.js")
        .done(function (script, textStatus) {
            console.log("Caricamento geofences completato");
        })
        .fail(function (jqxhr, settings, exception) {
            console.log("Errore nel caricamento delle geofences");
        });


    $.getScript("./get_geofences_vietate.js")
        .done(function (script, textStatus) {
            console.log("Caricamento geofences vietate completato");
        })
        .fail(function (jqxhr, settings, exception) {
            console.log("Errore nel caricamento delle geofences vietate");
        });
}

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