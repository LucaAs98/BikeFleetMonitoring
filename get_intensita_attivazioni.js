var maxValoriUnivoci = 6;
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

    let valuesGeoNormali = [];
    let valuesGeoVietate = [];
    for (let value of Object.values(window.attivazioniGeofence)) {
        if (value.vietata === 'False') {
            valuesGeoNormali.push(value);
        } else {
            valuesGeoVietate.push(value);
        }
    }
    let nAttivazioniUnivocheNormali = getNValoriUnivoci(valuesGeoNormali);
    let nAttivazioniUnivocheVietate = getNValoriUnivoci(valuesGeoVietate);

    let maxGeof = Math.max.apply(null, valuesGeoNormali.map(item => item.attivazioni));
    let maxGeofViet = Math.max.apply(null, valuesGeoVietate.map(item => item.attivazioni));
    window.rangeArrayNormale = split(0, maxGeof, calcolaMaxParti(nAttivazioniUnivocheNormali));
    window.rangeArrayVietato = split(0, maxGeofViet, calcolaMaxParti(nAttivazioniUnivocheVietate));

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
            abilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
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

function getNValoriUnivoci(geofenceObject) {
    let valori = [];
    console.log(geofenceObject);
    for (let valore of geofenceObject) {
        valori.indexOf(valore.attivazioni) === -1 ? valori.push(valore.attivazioni) : console.log("This item already exists");
    }
    return valori.length;
}

function calcolaMaxParti(valoriUnivoci) {
    if (valoriUnivoci < maxValoriUnivoci) {
        return valoriUnivoci;
    } else {
        return maxValoriUnivoci;
    }
}