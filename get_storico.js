var jsonFeatures = [];      //Contiene tutti i percorsi ed il codice di prenotazione del noleggio corrispondente
var storicoEDati = [];      //Contiene lo storico con i dati veri e propri dei layer attivi
window.storicoLayerAttivi = []; //Contiene i layer attivi

sidebar.on('hide', function () {
    pulisciStorici();
});

//Contiene i layer attivi dei punti di partenza e di arrivo per ogni percorso, ci serve per mettere i marker
window.storicoLayerPointsAttivi = [];

//Icone per i marker di partenza e di arrivo di ogni percorso
var startIcon = L.icon({
    iconUrl: 'icons/iconStart.svg',
    iconSize: [20, 50], // size of the icon
    iconAnchor: [11, 40], // point of the icon which will correspond to marker's location
});
var finishIcon = L.icon({
    iconUrl: 'icons/iconEnd.svg',
    iconSize: [20, 50], // size of the icon
    iconAnchor: [11, 40], // point of the icon which will correspond to marker's location
});

getStorico();

//Utile a prendere gli storici dal DB
async function getStorico() {
    const response = await fetch('/storico');
    const datiStorico = await response.json();

    //Aggiungiamo gli storici alla mappa
    addStorico(datiStorico);
}

async function addStorico(datiStorico) {

    //Ogni storico lo aggiungiamo al nostro "jsonFeatures" che contiene l'oggetto di ogni storico
    datiStorico.forEach(function (lineString) {
        var geometry = JSON.parse(lineString.geometry);

        var feature = {
            type: 'Feature',
            geometry: {
                type: geometry.type,
                coordinates: geometry.coordinates,
            },
            properties: {
                codice: lineString.codice
            }
        };
        jsonFeatures.push(feature);
    });

    //Creiamo la sidebar che si aprirà a sx della schermata, aggiungendo tutti i bottoni e le critte che ci servono
    await creaSidebar();
}

//Metodo per creare la sidebar degli storici.
async function creaSidebar() {
    let datiNoleggio = [];      //Array contenente i dati di ogni singolo noleggio, utile per ricavare i dati da visualizzare nella sidebar
    let responseDatiNoleggio;   //Metiamo di volta in volta la risposta che otteniamo alla richiesta dei dati
    let i = 0;                  //Indice per creare un id univoco per i bottoni della sidebar
    let idBottone;              //Conterrà l'id vero e proprio del bottone

    /* Variabile che contiene tutto l'html da visualizzare nella sidebar.
    *  Partiamo aggiungendo i primi tre bottoni per visualizzare tutti i percorsi, per pulire la schermata o per visualizzare
    *  l'heatmap dei percorsi. Ognuno di questi bottoni richiama un metodo ben preciso. */
    let contentSidebar = '<button type="button" class="btn-sm btn-block btn btn-primary" onClick="vediTuttiGliStorici()">Visualizza tutti</button>' +
        '<button type="button" class="btn-sm btn-block btn btn-primary" onClick="pulisciStorici()">Pulisci storici</button>' +
        '<button type="button" id="vediHeatmap" class="btn-sm btn-block btn btn-primary" onClick="vediHeatmap()">Visualizza HeatMap</button><br>';

    // Aggiungiamo i dati di ogni storico alla sidebar.
    for (let feature of jsonFeatures) {
        idBottone = "btnVisualizzaStorico" + i;                     //Creiamo l'id del bottone
        responseDatiNoleggio = await fetch('/get_dati_noleggio?codice_noleggio=' + feature.properties.codice);  //Richiediamo i dati del noleggio

        datiNoleggio.push(await responseDatiNoleggio.json());   //Pushiamo i dati ottenuti nel nostro array


        let dataInizio = new Date(datiNoleggio[datiNoleggio.length - 1][0].data_inizio).getDate() + "-" + (new Date(datiNoleggio[datiNoleggio.length - 1][0].data_inizio).getMonth() + 1) + "-" + new Date(datiNoleggio[datiNoleggio.length - 1][0].data_inizio).getFullYear();
        //Aggiungiamo alla sidebar il codice per visualizzare i dati di ogni storico
        contentSidebar +=
            '<br>' +
            '<table id="tableDatiNoleggio">' +
            '<span> <b>Bicicletta:</b> ' + datiNoleggio[datiNoleggio.length - 1][0].bicicletta + '</span><br>' +
            '<span> <b>Data inizio:</b> ' + dataInizio + '</span>' +
            '<button type="button" class="btn btn-primary buttonVisualizzaStorico" id=' + idBottone + ' onClick="visualizzaStorico(\'' + feature.properties.codice + '\', \'' + i + '\')">Visualizza storico</button><br>' +
            '<span> <b>Utente:</b> ' + datiNoleggio[datiNoleggio.length - 1][0].utente + '</span>' +
            '</table>' +
            '<br><br>';

        i++;
    }


    //Aggiungiamo l'html appena preso alla sidebar
    sidebar.setContent(contentSidebar);

    pulisciStorici();
}

/* Metodo che ogni bottone della sidebar richiama di default al click. Come dice il nome serve per visualizzare lo storico
*  corrispondente a quel bottone.  Questo lo usiamo anche per visualizzare tutti gli storici in una volta, richiamandolo su ogni storico. */
async function visualizzaStorico(codice, indice) {
    let featuresGeoJson = [];       //Contiene l'unico storico cliccato (che si vuole visualizzare)
    let pointsGeoJson = [];         //Contiene il punto di partenza ed il punto di arrivo dell'unico storico cliccato

    //Scorriamo ogni feature e troviamo quella che è stata effettivamente cliccata
    for (let feature of jsonFeatures) {
        if (feature.properties.codice === codice) {
            //Prendiamo il punto d'inizio e di fine dell'unico storico che ci interessa e li aggiungiamo al nostro array
            let featureStartPoint = getStartPoint(feature)
            let featureEndPoint = getEndPoint(feature);
            pointsGeoJson.push(featureStartPoint);
            pointsGeoJson.push(featureEndPoint);

            //Aggiungiamo la feature dell'unico storico che ci interessa
            featuresGeoJson.push(feature);
        }
    }

    /* Controlliamo che all'interno del nostro array che contiene tutti i dati degli storici che stiamo già visualizzando
    *  non sia già presente quello che vogliamo aggiungere. Questo per evitare di avere layer doppi sulla mappa. */
    if (!storicoEDati.some(e => e.properties.codice === featuresGeoJson[0].properties.codice)) {
        let geoJson = {type: 'FeatureCollection', features: featuresGeoJson};
        let pointJSON = {type: 'FeatureCollection', features: pointsGeoJson};

        //Creaimo sia il layer per visualizzare la riga del tragitto, sia quello per vedere il punto di inizio o fine
        let layerStorico = L.geoJson(geoJson);
        let pointsStorico = L.geoJson(pointJSON, {
            pointToLayer: function (feature, latlng) {
                //Utile per mettere l'icona correta di inizio o fine
                if (feature.feature.start) {
                    return L.marker(latlng, {icon: startIcon});
                } else {
                    return L.marker(latlng, {icon: finishIcon});
                }
            }
        });

        /* Ci ricaviamo il pulsante cliccato, gli cambiamo la funzione che dovrà svolgere quando verrà cliccato
         * la prossima volta e la nuova scritta da visualizzare. */
        let htmlButton = document.getElementById('btnVisualizzaStorico' + indice);
        htmlButton.onclick = function () {
            rimuoviLayer(layerStorico, codice, indice, pointsStorico)
        };
        htmlButton.textContent = "Nascondi storico";

        // Pushiamo il nuovo layer attivo nei vari array corrispondenti ed aggiungiamoli alla mappa.
        window.storicoLayerAttivi.push(layerStorico);
        window.storicoLayerPointsAttivi.push(pointsStorico)
        layerStorico.addTo(mymap);
        pointsStorico.addTo(mymap);

        //Pushiamo i dati (del nuovo layer visualizzato) nel nostro storico.
        storicoEDati.push(featuresGeoJson[0]);
    }
}

//Metodo per rimuovere singolarmente ogni storico. Funziona come il metodo precedente, ma rimuove i layer invece di aggiungerli
function rimuoviLayer(layerStorico, codice, indice, pointsStorico) {
    //Condizione utile per controllare che il layer che vogliamo rimuovere esista e che sia presente nel nostro array dello storico dei dati
    if (layerStorico !== undefined && checkStoricoDati(codice)) {
        /* Prendiamo il bottone e modifichiamo le sue caratteristiche in modo tale da visualizzare il messaggio corretto e che,
         * una volta ricliccato faccia visualizzare di nuovo lo storico. */
        let htmlButton = document.getElementById('btnVisualizzaStorico' + indice);
        htmlButton.onclick = function () {
            visualizzaStorico(codice, indice);
        }
        htmlButton.textContent = "Visualizza storico";

        //Togliamo da tutti i nostri array lo storico che stiamo andando a rimuovere e lo rimuoviamo anche dalla mappa
        storicoEDati = storicoEDati.filter(elem => elem.properties.codice !== codice);
        window.storicoLayerAttivi = window.storicoLayerAttivi.filter(elem => elem !== layerStorico);
        window.storicoLayerPointsAttivi = window.storicoLayerPointsAttivi.filter(elem => elem !== pointsStorico);
        mymap.removeLayer(layerStorico);
        mymap.removeLayer(pointsStorico);
    }
}

/* Metodo utile a ripulire tutti gli storici presenti nella schermata, semplicemente scorriamo tutti gli storici e
*  richiamiamo su di essi il "rimuoviLayer" che gestisce il tutto autonomamente. */
function pulisciStorici() {
    let indiceFeature = 0;
    for (let feature of jsonFeatures) {
        rimuoviLayer(window.storicoLayerAttivi[0], feature.properties.codice, indiceFeature, window.storicoLayerPointsAttivi[0]);
        indiceFeature++;
    }
}

/* Metodo utile a visualizzare tutti gli storici sulla schermata, semplicemente scorriamo tutti gli storici e
*  richiamiamo su di essi il "visualizzaStorico" che gestisce il tutto autonomamente. */
function vediTuttiGliStorici() {
    let indiceFeature = 0;
    for (let feature of jsonFeatures) {
        visualizzaStorico(feature.properties.codice, indiceFeature);
        indiceFeature++;
    }
}

//Restituisce il punto di partenza dato uno storico, utilizzato per creare i marker di partenza.
function getStartPoint(feature) {
    return {
        type: 'Feature',
        geometry: {
            type: "Point",
            coordinates: feature.geometry.coordinates[0],
        },
        feature: {
            start: true
        }
    };
}

//Restituisce il punto di arrivo dato uno storico, utilizzato per creare i marker di arrivo.
function getEndPoint(feature) {
    return {
        type: 'Feature',
        geometry: {
            type: "Point",
            coordinates: feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
        },
        feature: {
            start: false
        }
    };
}

/* Metodo utile a controllare che un certo codice sia presente nello storico. Usato nel rimuoviLayer per sincronizzare
 * l'aggiunta di tutti i layer e la pulizia di essi quando venivano toccati singolarmente. */
function checkStoricoDati(codice) {
    for (let item in storicoEDati) {
        if (storicoEDati[item].properties.codice === codice) {
            return true;
        }
    }
    return false;
}

/*** HEATMAP PERCORSI ***/
//Metodo utile all'aggiunta dell'heatmap dei percorsi sulla mappa. Ci mostrerà quali sono le zone dove le bici sono passate di più
function vediHeatmap() {
    let coordinateHeatmap = []; //Array formattato in modo tale da poterlo usare per creare un heatmap layer

    //Popoliamo l'array dichiaratto precedentemente prendendo i dati da "jsonFeatures"
    for (let feature of jsonFeatures) {
        for (let coordinates of feature.geometry.coordinates) {
            coordinateHeatmap.push({
                lng: coordinates[0],
                lat: coordinates[1],
                intensity: 1
            });
        }
    }

    //Aggiungiamo l'heatmap layer sulla nostra mappa
    window.heatmapLayer = L.heatLayer(coordinateHeatmap, {radius: 60}).addTo(mymap);
    mymap.removeLayer(window.geofence);
    mymap.removeLayer(window.geofenceVietate);

    /* Cambiamo il comportamento del bottone che clicchiamo per la visualizzazione dell'heatmap. Ora visualizzerà un altro
     * messaggio ed al suo click dovrà nascondere l'heatmap. */
    let htmlButton = document.getElementById('vediHeatmap');
    htmlButton.onclick = function () {
        rimuoviHeatmap(heatmapLayer);
        window.geofence.addTo(mymap);
        window.geofenceVietate.addTo(mymap);
    }
    htmlButton.textContent = "Nascondi Heatmap";
}

//Metodo utile a rimuovere l'heatmap dalla mappa e a cambare il comportamento del bottone (simile a prima)
function rimuoviHeatmap(heatmapLayer) {
    mymap.removeLayer(heatmapLayer);
    let htmlButton = document.getElementById('vediHeatmap');
    htmlButton.onclick = function () {
        vediHeatmap();
    }
    htmlButton.textContent = "Visualizza Heatmap";
}