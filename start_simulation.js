avvia();

async function avvia() {
    var geom = ""
    var formBody = [];

    var latRastrellieraPartenza = 44.48761;
    var longRastrellieraPArtenza = 11.344264;

    var user = {
        username: "Luca",
        password: "6666"
    }

    var maxSalti = Math.floor(Math.random() * (30 - 10 + 1) + 10)

    var prenotazione = {
        di: "2021-08-11 11:05:00",
        df: "2021-08-11 11:05:00",
        utente: user.username,
        bici: 6,
        cod: "ciaoGerry!",
        ras: 1,
    }

    var noleggio = {
        codNoleggio: prenotazione.cod,
        bici: prenotazione.bici
    }

    /* Crea nuovo utente */
    await newUser();

    function newUser() {
        formBody = [];
        for (var property in user) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(user[property]);
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

    /* Faccio prenotare la bici 6 a tale utente. */
    await newPrenotazione();

    async function newPrenotazione() {
        formBody = [];
        for (var property in prenotazione) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(prenotazione[property]);
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
    await newNoleggio();

    async function newNoleggio() {
        formBody = [];
        for (var property in noleggio) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(noleggio[property]);
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

    /* Mandiamo le posizioni in tempo reale. Successivamente  (a posizioni finite) terminiamo il noleggio. */
    var i = 0;
    var x0 = 11.343083149519329; //longitudine centro
    var y0 = 44.501726198465064; //latitudine centro
    var rd = 1300 / 111300;
    sendPositions();

    async function sendPositions() {

        formBody = [];

        var lat;
        var long;

        if (geom.length === 0) {
            lat = latRastrellieraPartenza;  //posizione rastrelliera di partenza
            long = longRastrellieraPArtenza;
        } else {
            //calcolo coordinate random
            var u = Math.random();
            var v = Math.random();

            var w = rd * Math.sqrt(u)
            var t = 2 * Math.PI * v
            var x = w * Math.cos(t)
            var y = w * Math.sin(t)

            long = (x / Math.cos(y0)) + x0;
            lat = y + y0;
        }

        //Creazione della stringa con tutte le geometrie
        if (geom.length > 0) {
            geom += ",";
        }
        geom += "[" + long + "," + lat + "]";

        //add della posizione
        var coordinates = {
            long: long,
            lat: lat,
            id: prenotazione.bici,
        }

        for (var property in coordinates) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(coordinates[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        console.log(formBody);

        fetch('/addPosizione', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody,
        }).then(async () => {
            i++;
            if (i < maxSalti) {//arrayGeom.length){
                setTimeout(sendPositions, 1000);
            } else {
                //se la posizione finale non è vicino a una rastrelliera, lo spostamento continua
                const response = await fetch('/checkDistance?lat=' + lat + '&lng=' + long, {
                    method: 'GET',
                });
                const data = await response.json();
                var id;
                console.log(data)
                if(data[0] !== undefined){
                    id = data[0].id;
                    terminaNoleggio(id);
                }else{
                    setTimeout(sendPositions, 1000);
                }
            }
        });
    }

    /* Faccio terminare il noleggio. */
    async function terminaNoleggio(id) {

        console.log("" + geom + "")

        var noleggioTerminato = {
            codNoleggio: prenotazione.cod,
            bici: prenotazione.bici,
            geom: "[" + geom + "]",
            rastrelliera: id
        }

        formBody = [];
        for (var property in noleggioTerminato) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(noleggioTerminato[property]);
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
    }
}