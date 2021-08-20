avvia();

async function avvia() {


    let arrUtenti = [];
    let arrPrenotazioni = [];
    let formBody = [];
    let geom = [];
    let maxUtenti = 3;


    function randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }


    for (let j = 0; j < maxUtenti; j++) {

        let user = {
            username: "User " + j,
            password: "6666"
        }
        arrUtenti.push(user);
    }


    /* Inserimento in db dei nuovi utenti */
    for (const user1 of arrUtenti) {

        formBody = [];
        for (let property in user1) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(user1[property]);
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
        geom.push("");

    }

    /* Faccio prenotare la bici 6 a tale utente. */


    for (const user1 of arrUtenti) {
        const n = arrUtenti.indexOf(user1);

        let prenotazione = {
            di: "2021-08-11 11:05:00",
            df: "2021-08-11 11:05:00",
            utente: user1.username,
            bici: n + 2,
            cod: randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            ras: 1,
        }

        arrPrenotazioni.push(prenotazione);


    }

    for (const prenotazione of arrPrenotazioni) {

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

    /* Faccio iniziare il noleggio. */
    for (const prenotazione of arrPrenotazioni) {

        let noleggio = {
            codNoleggio: prenotazione.cod,

        }


        formBody = [];
        for (let property in noleggio) {

            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(noleggio[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch('/avvia_noleggio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody,
        });

    }


    let latRastrellieraPartenza = 44.48761;
    let longRastrellieraPArtenza = 11.344264;

    let maxSalti = Math.floor(Math.random() * (30 - 10 + 1) + 10)

    /* Mandiamo le posizioni in tempo reale. Successivamente  (a posizioni finite) terminiamo il noleggio. */
    let i = 0;
    let x0 = 11.343083149519329; //longitudine centro
    let y0 = 44.501726198465064; //latitudine centro
    let rd = 1300 / 111300;
    sendPositions();

    async function sendPositions() {

        for (const prenotazione of arrPrenotazioni) {
            const n = arrPrenotazioni.indexOf(prenotazione);

            formBody = [];

            let lat;
            let long;

            if (geom[n].length === 0) {
                lat = latRastrellieraPartenza;  //posizione rastrelliera di partenza
                long = longRastrellieraPArtenza;
            } else {
                //calcolo coordinate random
                let u = Math.random();
                let v = Math.random();

                let w = rd * Math.sqrt(u)
                let t = 2 * Math.PI * v
                let x = w * Math.cos(t)
                let y = w * Math.sin(t)

                long = (x / Math.cos(y0)) + x0;
                lat = y + y0;
            }

            //Creazione della stringa con tutte le geometrie
            if (geom[n].length > 0) {
                geom[n] += ",";
            }
            geom[n] += "[" + long + "," + lat + "]";

            //add della posizione
            let coordinates = {
                long: long,
                lat: lat,
                id: prenotazione.bici,
            }

            for (let property in coordinates) {
                let encodedKey = encodeURIComponent(property);
                let encodedValue = encodeURIComponent(coordinates[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");


            fetch('/addPosizione', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody,
            });


        }
        i++;
        if (i < maxSalti) {//arrayGeom.length){
            setTimeout(sendPositions, 1000);
        } else {
            terminaNoleggio();
            //se la posizione finale non è vicino a una rastrelliera, lo spostamento continua
            /* const response = await fetch('/checkDistance?lat=' + lat + '&lng=' + long, {
                 method: 'GET',
             });
             const data = await response.json();
             let id;
             console.log(data)
             if (data[0] !== undefined) {
                 id = data[0].id;
                 terminaNoleggio(id);
             } else {
                 setTimeout(sendPositions, 1000);
             }*/
        }
    }

    /* Faccio terminare il noleggio. */
    async function terminaNoleggio() {

        for (const prenotazione of arrPrenotazioni) {
            const n = arrPrenotazioni.indexOf(prenotazione);

            let noleggioTerminato = {
                codNoleggio: prenotazione.cod,
                bici: prenotazione.bici,
                geom: "[" + geom[n] + "]",
                rastrelliera: prenotazione.ras
            }

            formBody = [];
            for (let property in noleggioTerminato) {
                let encodedKey = encodeURIComponent(property);
                let encodedValue = encodeURIComponent(noleggioTerminato[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");

            fetch('/termina_noleggio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody,
            });

        }


    }
}