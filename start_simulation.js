avvia();

async function avvia() {
    var geom = "[11.32660388946533,44.516812340467965],[11.326818466186523,44.51630742902544],[11.32688283920288,44.51589431640924],[11.32716178894043,44.51566480813476],[11.32814884185791,44.51566480813476],[11.328449249267578,44.51583311429111],[11.328449249267578,44.516032020940074],[11.328363418579102,44.5162003260358],[11.328127384185791,44.516246227341185],[11.327848434448242,44.516246227341185],[11.327741146087646,44.516246227341185],[11.327290534973145,44.51626152776827],[11.327033042907715,44.516246227341185],[11.327526569366455,44.51641453181823],[11.327977180480957,44.51652163441419],[11.328105926513672,44.516689938095766],[11.328041553497313,44.516842941020855],[11.327676773071289,44.51698064330993],[11.327075958251953,44.51696534307164],[11.32688283920288,44.51688884182002],[11.326711177825928,44.516842941020855],[11.326861381530762,44.51581781375153],[11.328277587890625,44.51564950755098],[11.32913589477539,44.517118345273566],[11.329929828643799,44.515726010429674],[11.329479217529295,44.51642983220115],[11.328706741333008,44.51641453181823],[11.32967233657837,44.51642983220115],[11.330122947692871,44.51564950755098],[11.330080032348633,44.51705714444102],[11.331431865692139,44.51696534307164],[11.330080032348633,44.51630742902544],[11.331710815429688,44.51574131099335],[11.33166790008545,44.51698064330993],[11.333169937133789,44.51687354155766],[11.331796646118164,44.516230926910076],[11.333062648773193,44.5158637153582],[11.331861019134521,44.51574131099335],[11.333556175231934,44.515771912108654],[11.33437156677246,44.51728664723169],[11.335186958312988,44.51581781375153],[11.334779262542725,44.51655223511972],[11.333963871002195,44.51650633405537]";
    var geomForArr = "[11.32660388946533,44.516812340467965] , [11.326818466186523,44.51630742902544] , [11.32688283920288,44.51589431640924] , [11.32716178894043,44.51566480813476] , [11.32814884185791,44.51566480813476] , [11.328449249267578,44.51583311429111] , [11.328449249267578,44.516032020940074] , [11.328363418579102,44.5162003260358] , [11.328127384185791,44.516246227341185] , [11.327848434448242,44.516246227341185] , [11.327741146087646,44.516246227341185] , [11.327290534973145,44.51626152776827] , [11.327033042907715,44.516246227341185] , [11.327526569366455,44.51641453181823] , [11.327977180480957,44.51652163441419] , [11.328105926513672,44.516689938095766] , [11.328041553497313,44.516842941020855] , [11.327676773071289,44.51698064330993] , [11.327075958251953,44.51696534307164] , [11.32688283920288,44.51688884182002] , [11.326711177825928,44.516842941020855] , [11.326861381530762,44.51581781375153] , [11.328277587890625,44.51564950755098] , [11.32913589477539,44.517118345273566] , [11.329929828643799,44.515726010429674] , [11.329479217529295,44.51642983220115] , [11.328706741333008,44.51641453181823] , [11.32967233657837,44.51642983220115] , [11.330122947692871,44.51564950755098] , [11.330080032348633,44.51705714444102] , [11.331431865692139,44.51696534307164] , [11.330080032348633,44.51630742902544] , [11.331710815429688,44.51574131099335] , [11.33166790008545,44.51698064330993] , [11.333169937133789,44.51687354155766] , [11.331796646118164,44.516230926910076] , [11.333062648773193,44.5158637153582] , [11.331861019134521,44.51574131099335] , [11.333556175231934,44.515771912108654] , [11.33437156677246,44.51728664723169] , [11.335186958312988,44.51581781375153] , [11.334779262542725,44.51655223511972] , [11.333963871002195,44.51650633405537]";
    var arrayGeom = geomForArr.split(" , ");
    var formBody = [];

    var user = {
        username: "Luca",
        password: "6666"
    }

    var prenotazione = {
        di: "2021-08-11 11:05:00",
        df: "2021-08-11 11:05:00",
        utente: user.username,
        bici: 6,
        cod: "ciaoGerry!",
    }

    var noleggio = {
        codNoleggio: prenotazione.cod,
        bici: prenotazione.bici
    }

    var noleggioTerminato = {
        codNoleggio: prenotazione.cod,
        bici: prenotazione.bici,
        geom: "[" + geom + "]",
        rastrelliera: 1
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

    /* setTimeout(sendPositions, 1000);

     async function sendPositions() {
         formBody = [];
         var arrLatLng = arrayGeom[i].split(",");

         var coordinates = {
             lat: arrLatLng[0].replace("[", ""),
             long: arrLatLng[1].replace("]", ""),
             id: prenotazione.bici,
         }

         console.log(coordinates.long);

         for (var property in coordinates) {
             var encodedKey = encodeURIComponent(property);
             var encodedValue = encodeURIComponent(coordinates[property]);
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
         i++;
         if (i < arrayGeom.length) {
             setTimeout(sendPositions, 500);
         } else {
             terminaNoleggio();
         }
     }*/

    var i = 0;
    sendPositions();

    async function sendPositions() {

        formBody = [];
        var arrLatLng = arrayGeom[i].split(",");

        var coordinates = {
            long: arrLatLng[0].replace("[", ""),
            lat: arrLatLng[1].replace("]", ""),
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
        }).then(() => {
            i++;
            if (i < arrayGeom.length){
                setTimeout(sendPositions, 1000);
            } else {
                terminaNoleggio();
            }
        });
    }

    /* Faccio terminare il noleggio. */
    async function terminaNoleggio() {
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