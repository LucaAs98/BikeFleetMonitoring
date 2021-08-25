let velocitaSimulazione = 500;

avvia();

async function avvia() {
    let arrUtenti = [];
    let formBody = [];
    let maxUtenti = 2;

    for (let j = 0; j < maxUtenti; j++) {

        let user = {
            username: "User" + j,
            password: "6666",
            prenotazione: {},
            terminazione: {
                coordinate: {},
                terminato: false
            },
            nEsecuzioni: 5
        }

        arrUtenti.push(user);
    }

    const responseUtenti = await fetch('/users', {
        method: 'GET',
    });
    const jsonUtenti = await responseUtenti.json();

    let flagRegistrazione;

    /*Inserimento nel database degli utenti se*/
    for (const user of arrUtenti) {
        flagRegistrazione = true;

        if (jsonUtenti !== undefined && jsonUtenti.length > 0) {
            for (let u = 0; u < jsonUtenti.length && flagRegistrazione; u++) {
                if (jsonUtenti[u].username === user.username) {
                    flagRegistrazione = false;
                }
            }
        }

        if (flagRegistrazione || (jsonUtenti !== undefined && jsonUtenti.length === 0)) {
            formBody = [];
            for (let property in user) {
                let encodedKey = encodeURIComponent(property);
                let encodedValue = encodeURIComponent(user[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");

            fetch('/registrazione', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody,
            });
        }
    }

    /* Prenotazione random della bicicletta */
    for (const user1 of arrUtenti) {
        await prenotaUtente(user1);
        await startNoleggio(user1);
    }

    await sendPositions();

    async function sendPositions() {
        let conTerminati = 0;

        for (const user of arrUtenti) {

            if (!(user.terminazione.terminato)) {

                formBody = [];

                let lat;
                let long;

                if (user.prenotazione.geom.length === 0) {
                    const responsePosRastr = await fetch('/pos_rastr?id=' + user.prenotazione.ras, {
                        method: 'GET',
                    });
                    const jsonPosRastr = await responsePosRastr.json();

                    lat = jsonPosRastr[0].lat;  //posizione rastrelliera di partenza
                    long = jsonPosRastr[0].long;

                } else {
                    let coordinate = calcoloCoordinate();
                    //calcolo coordinate random

                    long = coordinate[0];
                    lat = coordinate[1];

                }

                //Creazione della stringa con tutte le geometrie
                if (user.prenotazione.geom.length > 0) {
                    user.prenotazione.geom += ",";

                }
                user.prenotazione.geom += "[" + long + "," + lat + "]";

                //add della posizione
                let coordinates = {
                    long: long,
                    lat: lat,
                    id: user.prenotazione.bici,
                }

                user.terminazione.coordinate = coordinates;

                for (let property in coordinates) {
                    let encodedKey = encodeURIComponent(property);
                    let encodedValue = encodeURIComponent(coordinates[property]);
                    formBody.push(encodedKey + "=" + encodedValue);

                }
                formBody = formBody.join("&");

                await fetch('/addPosizione', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formBody,
                });

                user.prenotazione.maxSalti--;

                if (user.prenotazione.maxSalti <= 0) {
                    await controlloTerminazione(user);
                }
            } else {
                conTerminati++;
            }
        }

        if (conTerminati < maxUtenti) {
            setTimeout(sendPositions, velocitaSimulazione);
        } else {
            abilitaPulsanti();
        }
    }
}


//Crea il codice per il noleggio
function randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//Crea un numero random tra min e max
function random_number(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getRastrellieraEBici() {
    let flagWhile = true;
    let ids = {
        idBici: -1,
        idRastr: -1
    }

    while (flagWhile) {
        const responseNRastrelliere = await fetch('/n_rastrelliere', {
            method: 'GET',
        });
        const jsonNRastrelliere = await responseNRastrelliere.json();
        ids.idRastr = random_number(1, jsonNRastrelliere[0].n_rastrelliere);

        const responseListaBici = await fetch('/lista_bici?id=' + ids.idRastr, {
            method: 'GET',
        });
        const jsonListaBici = await responseListaBici.json();

        if (jsonListaBici !== undefined && jsonListaBici.length > 0) {
            ids.idBici = jsonListaBici[random_number(0, jsonListaBici.length - 1)].id;
            flagWhile = false;
        }
    }

    return ids;
}

async function prenotaUtente(user) {

    let ids = await getRastrellieraEBici();
    let prenotazione = {
        di: "2021-08-11 11:05:00",
        df: "2021-08-11 11:05:00",
        utente: user.username,
        bici: ids.idBici,
        cod: randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        ras: ids.idRastr,
        geom: "",
        maxSalti: random_number(5, 5)
    }

    user.prenotazione = prenotazione;

    formBody = [];
    for (let property in prenotazione) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(prenotazione[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('/prenota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });
}

async function startNoleggio(user) {
    let noleggio = {
        codNoleggio: user.prenotazione.cod,
    }

    formBody = [];
    for (let property in noleggio) {

        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(noleggio[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    await fetch('/avvia_noleggio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });
}

//Controlla se la terminazione è possibile. Se lo è, effettua la terminazione del noleggio
async function controlloTerminazione(user) {
    //se la posizione finale non è vicino a una rastrelliera, lo spostamento continua
    const response = await fetch('/checkDistance?lat=' + user.terminazione.coordinate.lat + '&lng=' + user.terminazione.coordinate.long, {
        method: 'GET',
    });
    const data = await response.json();
    let id;

    if (data[0] !== undefined) {
        id = data[0].id;
        user.terminazione.terminato = true;
        await terminaNoleggio(id, user);
    }
}

/* Faccio terminare il noleggio. */
async function terminaNoleggio(id, user) {

    let noleggioTerminato = {
        codNoleggio: user.prenotazione.cod,
        bici: user.prenotazione.bici,
        geom: "[" + user.prenotazione.geom + "]",
        rastrelliera: id
    }

    formBody = [];
    for (let property in noleggioTerminato) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(noleggioTerminato[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    await fetch('/termina_noleggio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });

    user.nEsecuzioni -= 1;
    if (user.nEsecuzioni > 0) {

        user.prenotazione = {};
        user.terminazione = {
            coordinate: {},
            terminato: false
        };

        await prenotaUtente(user);
        await startNoleggio(user);
    }


}

function calcoloCoordinate() {
    let x0 = 11.341967582702637; //longitudine centro
    let y0 = 44.49518903364097; //latitudine centro
    let rd = 1500 / 111300;

    let u = Math.random();
    let v = Math.random();

    let w = rd * Math.sqrt(u)
    let t = 2 * Math.PI * v
    let x = w * Math.cos(t)
    let y = w * Math.sin(t)

    let long = (x / Math.cos(y0)) + x0;
    let lat = y + y0;

    return [long, lat];
}