var velocitaSimulazione = 500;

avvia();

async function avvia() {
    let arrUtenti = []; //Array degli utenti
    let formBody = [];  //Body da passare alla richiesa POST
    let maxUtenti = htmlInputUtenti.value;  //Numero utenti nella simulazione

    for (let j = 0; j < maxUtenti; j++) {
        //Creiamo gli utenti come "User0","User1","User2", ecc..
        let user = {
            username: "User" + j,
            password: "6666",
            prenotazione: {},
            terminazione: {
                coordinate: {},
                terminato: false
            },
            nEsecuzioni: htmlInputIterazioni.value  //Ogni utente ha un tot di simulazioni che può fare. Quando ne finisce una ne ricomincia un'altra
        }
        arrUtenti.push(user);
    }

    const responseUtenti = await fetch('/users', {
        method: 'GET',
    });
    const jsonUtenti = await responseUtenti.json();

    let flagRegistrazione;

    //Inserimento nel database degli utenti. Li registriamo solo se non sono già presenti.
    for (const user of arrUtenti) {
        flagRegistrazione = true;

        if (jsonUtenti !== undefined && jsonUtenti.length > 0) {
            for (let u = 0; u < jsonUtenti.length && flagRegistrazione; u++) {
                if (jsonUtenti[u].username === user.username) {
                    flagRegistrazione = false;
                }
            }
        }

        //Se non è presente registriamolo
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

    //Ogni utente prenota ed inizia a noleggiare una bici.
    for (const user1 of arrUtenti) {
        await prenotaUtente(user1);
        await startNoleggio(user1);
    }

    //Aggiungiamo le posizioni degli utenti che stanno noleggiando.
    await sendPositions();

    async function sendPositions() {
        let conTerminati = 0;

        for (const user of arrUtenti) {
            if (!(user.terminazione.terminato)) {
                formBody = [];
                let lat;
                let long;

                if (user.prenotazione.geom.length === 0) {      //Mettiamo la bici nela rastrelliera più vicino
                    const responsePosRastr = await fetch('/pos_rastr?id=' + user.prenotazione.ras, {
                        method: 'GET',
                    });
                    const jsonPosRastr = await responsePosRastr.json();

                    lat = jsonPosRastr[0].lat;      //Latitudine rastrelliera di partenza
                    long = jsonPosRastr[0].long;    //Longitudine rastrelliera di partenza

                } else {
                    let coordinate = calcoloCoordinate();   //Calcolo coordinate random di spostamento

                    long = coordinate[0];                   //Longitudine di spostamento successivo
                    lat = coordinate[1];                    //Latitudine di spostamento successivo

                }

                //Creazione della stringa con tutte le geometrie
                if (user.prenotazione.geom.length > 0) {
                    user.prenotazione.geom += ",";
                }
                user.prenotazione.geom += "[" + long + "," + lat + "]";

                //Aggiungiamo la posizione
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

                //Decrementiamo i salti che ha fatto l'utente
                user.prenotazione.maxSalti--;

                //Se ha superato il limite dei salti possibili allora controlliamo che possa terminare il noleggio
                if (user.prenotazione.maxSalti <= 0) {
                    await controlloTerminazione(user);
                }
            } else {
                //Utenti che hanno terminato le loro simulazioni
                conTerminati++;
            }
        }

        //Se non hanno finito tutti gli utenti allora continuiamo, altrimenti abilitiamo nuovamente tutti i pulsanti e terminiamo la simulazione
        if (conTerminati < maxUtenti) {
            setTimeout(sendPositions, velocitaSimulazione);
        } else {
            buttonSimulazione.innerHTML = 'Avvia Simulazione';
            abilitaPulsanti([buttonViewStorico, buttonReset, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
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

//Prende una rastrelliera random ed una sua bici sempre a caso.
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

//Metodo grazie alla quale l'utetnte prenota una bici
async function prenotaUtente(user) {
    let ids = await getRastrellieraEBici();     //Prendiamo randomicamente una rastrelliera ed una bici presso di essa

    let prenotazione = {                        //Creiamo una prenotazione ed assegnamola all'utente
        di: getCurrentTime(),
        utente: user.username,
        bici: ids.idBici,
        cod: randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        ras: ids.idRastr,
        geom: "",
        maxSalti: random_number(5, 20)
    }
    user.prenotazione = prenotazione;

    //Creiamo il body da passare alla richiesta per la prenotazione
    let formBody = [];
    for (let property in prenotazione) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(prenotazione[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log(prenotazione)
    fetch('/prenota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });
    console.log(prenotazione)
}

//Metodo per far partire il noleggio da parte di un utente
async function startNoleggio(user) {
    let noleggio = {                    //Creiamo l'oggetto del noleggio per passare i suoi ati al body della richiesta
        codNoleggio: user.prenotazione.cod,
    }

    let formBody = [];
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
    //Se la posizione finale non è vicino a una rastrelliera, lo spostamento continua
    const response = await fetch('/checkDistance?lat=' + user.terminazione.coordinate.lat + '&lng=' + user.terminazione.coordinate.long, {
        method: 'GET',
    });
    const data = await response.json();

    //data[0] sarà undefined se l'utente non si trova vicino ad una rastrelliera
    if (data[0] !== undefined) {
        user.terminazione.terminato = true;             //Segnaliamo che l'utene ha terminato
        await terminaNoleggio(data[0].id, user);        //Terminiamo il noleggio
    }
}

//Facciamo terminare il noleggio.
async function terminaNoleggio(id, user) {
    //Salviamo i dai per concludere il noleggio, in modo tale da passarli al body della richiesta
    let noleggioTerminato = {
        codNoleggio: user.prenotazione.cod,
        bici: user.prenotazione.bici,
        geom: "[" + user.prenotazione.geom + "]",
        rastrelliera: id,
        df: getCurrentTime()
    }

    let formBody = [];
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

    //Sottraiamo il numero di esecuzioni ch erestano all'utente
    user.nEsecuzioni -= 1;

    //Se l'utente ha ancora esecuzionni disponibili resettiamo i suoi dati
    if (user.nEsecuzioni > 0) {
        user.prenotazione = {};
        user.terminazione = {
            coordinate: {},
            terminato: false
        };

        //Avviamo una nuova prenotazione e noleggio
        await prenotaUtente(user);
        await startNoleggio(user);
    }
}

/* Calcoliamo le coordinate per simulare lo spostamento dell'utente nella mappa. Non ci spostiamo troppo dal centro
 * delle mura, cercando di stare all'interno. */
function calcoloCoordinate() {
    let x0 = 11.341967582702637;    //Longitudine centro
    let y0 = 44.49518903364097;     //Latitudine centro
    let rd = 1500 / 111300;

    let u = Math.random();
    let v = Math.random();

    let w = rd * Math.sqrt(u)
    let t = 2 * Math.PI * v
    let x = w * Math.cos(t)
    let y = w * Math.sin(t)

    let long = (x / Math.cos(y0)) + x0;
    let lat = y + y0;

    return [long, lat];             //Posizione dove si sposterà
}

function getCurrentTime() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}