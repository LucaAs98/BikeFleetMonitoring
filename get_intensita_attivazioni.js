getIntensitaAttivazioni();

async function getIntensitaAttivazioni() {
    const response = await fetch('/storico');
    const data = await response.json();

    await addIntensitaAttivazioni(data);
}

async function addIntensitaAttivazioni(data) {
    /* Prendiamo le geofence normali e creiamo un oggetto che le contenga, ci servirà per calcolare il numero
     * di attivazioni. */
    var geofenceResponse = await fetch('/geofence');
    var geofence = await geofenceResponse.json();
    const attivazioniGeofence = {};

    for (const key of geofence) {
        attivazioniGeofence[key.name] = {
            attivazioni: 0,
            vietata: 'False',
        };
    }

    //Prendiamo le geofence vietate e aggiungiamole al nostro oggetto
    geofenceResponse = await fetch('/geofenceVietate');
    geofence = await geofenceResponse.json();


    for (const key of geofence) {
        attivazioniGeofence[key.name] = {
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
                    attivazioniGeofence[geof.name].attivazioni += 1;
                    prevGeof.push(geof.name);
                }
            }
            prevGeof = [];

            for (let geof of geofenceIntersecate) {
                prevGeof.push(geof.name);
            }
        }
    }
    console.log(attivazioniGeofence);
}

/* async function addIntensitaAttivazioni(data) {
    /* Prendiamo le geofence normali e creiamo un oggetto che le contenga, ci servirà per calcolare il numero
     * di attivazioni. */
/* var geofenceResponse = await fetch('/geofence');
var geofence = await geofenceResponse.json();
const attivazioniGeofence = {};

for (const key of geofence) {
    attivazioniGeofence[key.name] = {
        attivazioni: 0,
        vietata: 'False',
    };
}

//Prendiamo le geofence vietate e aggiungiamole al nostro oggetto
geofenceResponse = await fetch('/geofenceVietate');
geofence = await geofenceResponse.json();


for (const key of geofence) {
    attivazioniGeofence[key.name] = {
        attivazioni: 0,
        vietata: 'True',
    };
}

for (const lineString of data) {
    var geometry = JSON.parse(lineString.geometry);
    var geofenceIntersecate = [];
    var prevGeof = "";       //Geofence intersecata in precedenza
    for (var point of geometry.coordinates) {


        var coordinates = {
            lng: point[0],
            lat: point[1],
        };

        const geofenceIntersecateResponse = await fetch('/intersezione_geofence?lat=' + coordinates.lat + '&lng=' + coordinates.lng, {
            method: 'GET',
        });

        geofenceIntersecate = await geofenceIntersecateResponse.json();

        if (geofenceIntersecate[0] !== undefined) {
            if (geofenceIntersecate[0].name !== prevGeof) {
                attivazioniGeofence[geofenceIntersecate[0].name].attivazioni += 1;
                prevGeof = geofenceIntersecate[0].name;
            }
        } else {
            prevGeof = "";
        }
    }
}
console.log(attivazioniGeofence);
}*/