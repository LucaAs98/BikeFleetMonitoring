var openstreetmapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibHVhc3UiLCJhIjoiY2tvYjkxaXp0MnhpbTJ3bHBwbGxsNnJoNSJ9.Pid7oDB9xsd0GYH-Hob9ow'
})
var dark = L.tileLayer('https://api.mapbox.com/styles/v1/luasu/ckod473892oqr17qp15a80xvy/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibHVhc3UiLCJhIjoiY2tvYjh6YXRvMWM5ZjJvbXVsdHg5amdlNyJ9.KbvDYwiPaooWljBNLEpLUA', {
    id: 'mapbox.mapbox-streets-v8',
    tileSize: 512,
    zoomOffset: -1,
    attribution: 'Map created by Luca Asunis',
});
var realTerrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
})
var light = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
var baseMaps = {
    "Dark": dark,
    "OpenStreetMap": openstreetmapLayer,
    "Light": light,
    "Satellite": realTerrain
};

var mymap = L.map('mapid', {
    center: [44.49712, 11.34248],
    zoom: 15,
    layers: [realTerrain],
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: 'topleft'
    },
});
var vediAttivazioni = false;

L.control.scale().addTo(mymap);
L.control.layers(baseMaps).addTo(mymap);

var geofenceData, geofenceVietateData;

/**** CARICA RASTRELLIERE *****/
$.getScript("./get_rastrelliere.js")
    .done(function (script, textStatus) {
        console.log("Caricamento rastrelliere completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento delle rastrelliere");
    });

/**** CARICA GEOFENCE *****/
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

/**** DISEGNA MARKER, GEOFENCE *****/
$.getScript("./draw.js")
    .done(function (script, textStatus) {
        console.log("Caricamento disegno completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento disegno");
    });


/**** RASTRELLIERE DA FILE *****/
var buttonAddRastrelliereFromFile = L.DomUtil.create('button', 'Aggiungi rastrelliere btn-block btn btn-light');
rimuoviDragBottone(buttonAddRastrelliereFromFile);
var optionsDialogRastrelliere = {
    size: [400, 150],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [100, 700],
    position: "topleft",
    initOpen: true
}

//Bottone per aggiungere rastrelliere da file
var btnAddRastrelliereFromFile = L.Control.extend({
    onAdd: function () {
        buttonAddRastrelliereFromFile.innerHTML = 'Aggiungi rastrelliere da file';
        L.DomEvent.on(buttonAddRastrelliereFromFile, 'click', function () {
            disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile])
            var dialog = L.control.dialog(optionsDialogRastrelliere)
                .setContent(
                    '<form enctype="multipart/form-data"  id="formFile" action="/rastrelliere_file" method="POST">' +
                    '<input type="file" name="file"  id="file" required><br>' +
                    '<button onclick="caricaFile()" class="btn btn-primary btn-block" name="submit">Carica File</button>' +
                    '</form>\n'
                ).addTo(mymap);
            dialog.hideResize();
            dialog.freeze();
            dialog.open();
        });
        return buttonAddRastrelliereFromFile;
    }
});

var addRastrelliere = (new btnAddRastrelliereFromFile()).addTo(mymap);


/**** Geofence DA FILE *****/
var buttonAddGeofenceFromFile = L.DomUtil.create('button', 'Aggiungi Geofence btn-block btn btn-light');
rimuoviDragBottone(buttonAddGeofenceFromFile);
var optionsDialogGeofence = {
    size: [400, 150],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [100, 700],
    position: "topleft",
    initOpen: true
}

//Bottone per aggiungere Geofence da file
var btnAddGeofenceFromFile = L.Control.extend({
    onAdd: function () {
        buttonAddGeofenceFromFile.innerHTML = 'Aggiungi geofence da file';
        L.DomEvent.on(buttonAddGeofenceFromFile, 'click', function () {
            disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile])
            var dialog = L.control.dialog(optionsDialogGeofence)
                .setContent(
                    '<form enctype="multipart/form-data"  id="formFile" action="/geofence_file" method="POST">' +
                    '<input type="file" name="file"  id="file" required><br>' +
                    '<button onclick="caricaFile()" class="btn btn-primary btn-block" name="submit">Carica File</button>' +
                    '</form>\n'
                ).addTo(mymap);
            dialog.hideResize();
            dialog.freeze();
            dialog.open();
        });
        return buttonAddGeofenceFromFile;
    }
});

var addGeofence = (new btnAddGeofenceFromFile()).addTo(mymap);

function caricaFile() {
    let entry = document.getElementById("file").files[0];
    console.log('doupload', entry)
    if (entry === undefined) {
        alert('Non hai selezionato nessun file da caricare!');
    }
}
/**** STORICO TRAGITTI *****/

var sidebar = L.control.sidebar('sidebar', {
    closeButton: false,
    position: 'left',
});

var buttonViewStorico = L.DomUtil.create('button', 'Storico btn btn-light btn-block');
rimuoviDragBottone(buttonViewStorico);
//Bottone per vedere lo storico dei tragitti
var btnViewStorico = L.Control.extend({
    onAdd: function () {
        let nascondiStorico = false;
        buttonViewStorico.innerHTML = 'Visualizza storico tragitti';
        L.DomEvent.on(buttonViewStorico, 'click', async function () {
            if (!nascondiStorico) {
                disabilitaPulsanti([buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);                //Rimuoviamo le rastrelliere dalla mappa
                mymap.removeLayer(window.clusterRastrelliere);
                buttonViewStorico.innerHTML = 'Nascondi tragitto';
                await $.getScript("./get_storico.js")
                    .done(function (script, textStatus) {
                        console.log("Caricamento storico completato");

                        mymap.addControl(sidebar);
                        //Mostriamo la sidebar sulla mappa
                        setTimeout(function () {
                            sidebar.show();
                        }, 0);

                        nascondiStorico = true;
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Errore nel caricamento storico tragitti");
                    });
            } else {
                buttonViewStorico.innerHTML = 'Visualizza storico tragitti';
                abilitaPulsanti([buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
                //Nascondiamo la sidebar e rimuoviamo tutti i layer presenti sulla mappa
                setTimeout(function () {
                    sidebar.hide();
                    mymap.removeControl(sidebar);
                }, 0);


                for (let item of window.storicoLayerAttivi) {
                    mymap.removeLayer(item);
                }

                for (let item of window.storicoLayerPointsAttivi) {
                    mymap.removeLayer(item);
                }

                if (window.heatmapLayer !== undefined)
                    mymap.removeLayer(window.heatmapLayer);

                //Aggiungiamo nuovamente le rastrelliere alla mappa
                window.clusterRastrelliere.addTo(mymap);

                nascondiStorico = false;
            }
        });
        return buttonViewStorico;
    }
});

var viewStorico = (new btnViewStorico()).addTo(mymap);


/**** BICI REAL-TIME *****/
window.abortLoopBikesRealTime = false;
let legendaBiciRealTime;
var buttonViewBikesRealTime = L.DomUtil.create('button', 'Bici tempo reale btn btn-light btn-block');
rimuoviDragBottone(buttonViewBikesRealTime);

let buttonDistanzaMaxRastrelliera = L.DomUtil.create('button', 'distanza_max_rastrelliera btn btn-light btn-block');
rimuoviDragBottone(buttonDistanzaMaxRastrelliera);

//Bottone per vedere gli utenti in real time
var btnViewBikesRealTime = L.Control.extend({
    onAdd: function () {
        var tid;
        let nascondiBiciRealTime = false;
        buttonViewBikesRealTime.innerHTML = 'Visualizza bici noleggiate in tempo reale';
        L.DomEvent.on(buttonViewBikesRealTime, 'click', function () {
            if (!nascondiBiciRealTime) {
                window.abortLoopBikesRealTime = false;
                buttonViewBikesRealTime.innerHTML = 'Nascondi bici noleggiate in tempo reale';
                tid = setTimeout(getScriptBikeRealTime, 10);
                nascondiBiciRealTime = true;
                mymap.removeLayer(window.clusterRastrelliere);
                aggiungiLegenda();
            } else {
                buttonViewBikesRealTime.innerHTML = 'Visualizza bici noleggiate in tempo reale';
                window.abortLoopBikesRealTime = true;
                mymap.removeLayer(window.layerBiciRealTime);
                nascondiBiciRealTime = false;
                window.clusterRastrelliere.addTo(mymap);    //Ri-aggiungiamo le bici alla mappa
                mymap.removeControl(legendaBiciRealTime);
            }
        });
        return buttonViewBikesRealTime;
    }
});

//Range distanza massima
let distanza = 1500;
var inputDistanzaMaxRastrelliera = L.Control.extend({
    onAdd: function () {
        buttonDistanzaMaxRastrelliera.innerHTML = '<label for="rangeDistanzaMassimaDaRastrelliera" id="sliderMaxDistance" class="form-label">Distanza massima da rastrelliera (' + distanza + 'km)</label>\n' +
            '<input type="range" class="form-range slider" id="rangeDistanzaMassimaDaRastrelliera" value="' + distanza + '" min="1000" max="5000" step="100">' +
            '<div class="sliderticks">\n' +
            '    <p>1</p>\n' +
            '    <p>1.5</p>\n' +
            '    <p>2</p>\n' +
            '    <p>2.5</p>\n' +
            '    <p>3</p>\n' +
            '    <p>3.5</p>\n' +
            '    <p>4</p>\n' +
            '    <p>4.5</p>\n' +
            '    <p>5</p>\n' +
            '  </div>'
        L.DomEvent.on(buttonDistanzaMaxRastrelliera, 'input', function () {
            distanza = document.getElementById("rangeDistanzaMassimaDaRastrelliera").value;
            document.getElementById("sliderMaxDistance").innerHTML = "Distanza massima da rastrelliera (" + distanza + "km)";
        });
        return buttonDistanzaMaxRastrelliera;
    },
});

function abortTimer(tid2) {
    clearTimeout(tid2);
}

function getScriptBikeRealTime() {
    $.getScript("./get_bici_real_time.js")
        .done(function (script, textStatus) {
            console.log("Caricamento bici in tempo reale avvenuto con successo!");
            if (window.abortLoopBikesRealTime) {
                abortTimer(tid);
            }
            mymap.removeLayer(window.layerBiciRealTime);
        })
        .fail(function (jqxhr, settings, exception) {
            console.log("Errore nel caricamento delle bici in tempo reale");
        })
    tid = setTimeout(getScriptBikeRealTime, 500); // repeat myself
}

var viewBikes = (new btnViewBikesRealTime()).addTo(mymap);
var viewInputMaxDistanza = (new inputDistanzaMaxRastrelliera()).addTo(mymap);

function aggiungiLegenda() {
    legendaBiciRealTime = L.control({position: 'bottomleft'});

    legendaBiciRealTime.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = ["In range", "Fuori range"];

        div.innerHTML = '<p>Legenda marker:</p>'


        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorMarkerRange(grades[i]) + '"></i> ' + grades[i] + '<br>';
        }
        return div;
    };

    legendaBiciRealTime.addTo(mymap);
}

function getColorMarkerRange(colore) {
    if (colore === "In range") {
        return "#0a7201"
    } else return "#ff0000"
}

/**** SIMULAZIONE *****/
var buttonSimulazione = L.DomUtil.create('button', 'Simulazione btn btn-light btn-block');
rimuoviDragBottone(buttonSimulazione);
let nascondiSimulazione = false;
var maxUtenti = 10;
var maxIteration = 5;
var dialogNumUtenti;

//Options per il dialog che si apre quando premiamo il bottone per clusterizzare
var optionsDialogNumUtenti = {
    size: [350, 280],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [180, 800],
    position: "topleft",
    initOpen: true,
}

//Dialogo per inserire il numero di utenti da simulare
dialogNumUtenti = L.control.dialog(optionsDialogNumUtenti).setContent(
    '<br><label> Numero utenti con la quale effettuare la simulazione: </label></br>' +
    '<input type="number" name="number_users" id="number_users" value="5" max="' + maxUtenti + '" required><br><br>' +
    '<label> Numero iterazioni per ogni utente: </label><br>' +
    '<input type="number" name="number_iteration" id="number_iteration" value="1" max="' + maxIteration + '" required><br><br>' +
    '<button class="btn btn-primary btn-block" onclick="avviaSimulazione()">Avvia</button>'
);
//Bottone per avviare la simulazione
var btnSimulazione = L.Control.extend({
    onAdd: function () {
        buttonSimulazione.innerHTML = 'Avvia Simulazione';
        L.DomEvent.on(buttonSimulazione, 'click', function () {
            disabilitaPulsanti([buttonViewStorico, buttonReset, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
            dialogNumUtenti.addTo(mymap);             //Aggiungiamo il dialog alla pagina
            dialogNumUtenti.hideResize();
            dialogNumUtenti.freeze();
            dialogNumUtenti.open();
        });
        return buttonSimulazione;
    }
});

var viewSimulazione = (new btnSimulazione()).addTo(mymap);

function avviaSimulazione() {
    window.htmlInputUtenti = document.getElementById('number_users');
    window.htmlInputIterazioni = document.getElementById('number_iteration');

    if (htmlInputUtenti.value > maxUtenti) {
        alert("Gli utenti non possono essere più di " + maxUtenti + "!")
    } else if (htmlInputIterazioni.value > maxIteration) {
        alert("Le iterazioni per ogni utente non possono essere più di " + maxIteration + "!")
    } else if (htmlInputUtenti.value < 1 || window.htmlInputIterazioni.value < 1) {
        alert("Gli utenti o le iterazioni per ogni utente non possono essere meno di 1!")
    } else {
        //Rimuoviamo il dialog
        dialogNumUtenti.remove();
        mymap.removeLayer(dialogNumUtenti);
        nascondiSimulazione = true;
        buttonSimulazione.innerHTML = 'Simulazione avviata!';
        $.getScript("./start_simulation.js")
            .done(function (script, textStatus) {
                console.log("Simulazione avviata!");
            })
            .fail(function (jqxhr, settings, exception) {
                console.log("Errore nell'avvio della simulazione!");
            });

    }
}

/**** CLUSTERING *****/
var buttonClustering = L.DomUtil.create('button', 'Clustering btn btn-light btn-block');
rimuoviDragBottone(buttonClustering);
var maxCluster = 10;
var dialogNumClusters;

//Options per il dialog che si apre quando premiamo il bottone per clusterizzare
var optionsDialogCluster = {
    size: [350, 300],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [180, 800],
    position: "topleft",
    initOpen: true,
}

//Dialogo per inserire il numero di cluster da fare
dialogNumClusters = L.control.dialog(optionsDialogCluster).setContent('<label> Numero di cluster: </label></br>' +
    '<input type="number" name="number_cluster" id="number_cluster" value="3" max="' + maxCluster + '" required><br><br>' +
    '<div class="form-check">' +
    '<input class="form-check-input" type="checkbox" name="con_data" id="con_data" onclick="abilitaDateDialog()">' +
    '<label class="form-check-label" for="con_data"> Inserisci intervallo </label> ' +
    '</div>' +
    '<label> Data inizio: </label></br> ' +
    '<input type="date" name="data_inizio" id="data_inizio" placeholder="Inserisci la data iniziale" disabled="true"><br><br>' +
    '<label> Data fine: </label></br> ' +
    '<input type="date" name="data_fine" id="data_fine" placeholder="Inserisci la data finale" disabled="true"><br><br>' +
    '<button class="btn btn-primary btn-block" onclick="avviaScriptClustering()">Avvia</button>'
);

let nascondiClustering = false;
//Bottone per avviare il clustering delle bici
var btnClustering = L.Control.extend({
    onAdd: function () {
        nascondiClustering = false;   //Variabile per capire se il pulsante è stato attivato o meno
        buttonClustering.innerHTML = 'Avvia Clustering';
        L.DomEvent.on(buttonClustering, 'click', function () {
            if (!nascondiClustering) {
                disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile])
                dialogNumClusters.addTo(mymap);             //Aggiungiamo il dialog alla pagina
                dialogNumClusters.hideResize();
                dialogNumClusters.freeze();
                dialogNumClusters.open();
            } else {
                abilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
                //Entriamo qui quando è stato terminato il clustering
                buttonClustering.innerHTML = 'Avvia Clustering';
                mymap.removeLayer(window.clusterKMEANS);    //Togliamo la clusterizzazione dalla mappa
                window.clusterRastrelliere.addTo(mymap);    //Ri-aggiungiamo le bici alla mappa
                nascondiClustering = false;
            }
        });
        return buttonClustering;
    }
});

var viewClustering = (new btnClustering()).addTo(mymap);

//Viene chiamata quando clicchiamo l'avvia sul dialog
function avviaScriptClustering() {
    window.htmlInputDataInizio = document.getElementById('data_inizio');
    window.htmlInputDataFine = document.getElementById('data_fine');
    window.htmlCheckbox = document.getElementById('con_data');

    window.numberOfClusters = document.getElementById('number_cluster').value;  //Prendiamo il numero di cluster che l'utente ha scelto per il KMEANS
    if (htmlCheckbox.checked) {
        if (htmlInputDataInizio.value === "" || htmlInputDataFine.value === "") {
            alert("Inserisci entrambe le date!");
            return;
        }

        if (new Date(htmlInputDataInizio.value) > new Date(htmlInputDataFine.value)) {
            alert("Hai inserito le date in modo errato! La data di fine non può essere più piccola di quella di inizio! ");
            return;
        }
    }

    //Se l'utente inserisce troppi cluster diamo errore, altrimenti (vedi else)
    if (document.getElementById('number_cluster').value > maxCluster) {
        alert("Non puoi inserire una suddivisione in cluster maggiore di " + maxCluster + "!");
    } else {
        if (document.getElementById('number_cluster').value < 0) {
            alert("Non puoi inserire una suddivisione in cluster minore di 0!");
        } else {
            disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
            //Rimuoviamo il dialog
            dialogNumClusters.remove();
            mymap.removeLayer(dialogNumClusters);
            buttonClustering.innerHTML = 'Termina clustering';
            nascondiClustering = true;
            //Avviamo lo script per clusterizzare
            $.getScript("./get_clustering.js")
                .done(function (script, textStatus) {
                    console.log("Clustering avviato!");
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("Errore nella visualizzazione del clustering!");
                });
        }
    }
}

function abilitaDateDialog() {
    let htmlInputDataInizio = document.getElementById('data_inizio');
    let htmlInputDataFine = document.getElementById('data_fine');

    htmlInputDataInizio.disabled = false;
    htmlInputDataFine.disabled = false;

    let htmlCheckbox = document.getElementById('con_data');
    htmlCheckbox.onclick = function () {
        disabilitaDateDialog();
    };
}

function disabilitaDateDialog() {
    let htmlInputDataInizio = document.getElementById('data_inizio');
    let htmlInputDataFine = document.getElementById('data_fine');

    htmlInputDataInizio.disabled = true;
    htmlInputDataFine.disabled = true;

    let htmlCheckbox = document.getElementById('con_data');
    htmlCheckbox.onclick = function () {
        abilitaDateDialog();
    };
}

/**** INTENSITA' ATTIVAZIONI GEOFENCE *****/
var buttonAttivazioni = L.DomUtil.create('button', 'Attivazioni btn btn-light btn-block');
rimuoviDragBottone(buttonAttivazioni);
var btnViewAttivazioni = L.Control.extend({
    onAdd: function () {
        let nascondiAttivaz = false;
        buttonAttivazioni.innerHTML = 'Visualizza intensità attivazioni geofence';
        L.DomEvent.on(buttonAttivazioni, 'click', function () {
            if (!nascondiAttivaz) {
                buttonAttivazioni.innerHTML = 'Nascondi intensità attivazioni geofence';
                disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
                $.getScript("./get_intensita_attivazioni.js")
                    .done(function (script, textStatus) {
                        console.log("Caricamento attivazioni completato");
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Errore nel caricamento delle attivazioni");
                    });
                nascondiAttivaz = true;
            } else {
                buttonAttivazioni.innerHTML = 'Visualizza intensità attivazioni geofence';
                vediAttivazioni = false;
                mymap.removeLayer(window.geofence);
                mymap.removeLayer(window.geofenceVietate);
                mymap.removeControl(window.legendGeofence);
                mymap.removeControl(window.legendGeofenceVietate);
                nascondiAttivaz = false;

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
        });
        return buttonAttivazioni;
    }
});

var viewAttivazioni = (new btnViewAttivazioni()).addTo(mymap);


/**** RESET *****/
var buttonReset = L.DomUtil.create('button', 'reset button btn btn-light btn-block');
rimuoviDragBottone(buttonReset);
var btnReset = L.Control.extend({
    onAdd: function () {
        let nascondiReset = false;
        buttonReset.innerHTML = 'Resetta database';
        L.DomEvent.on(buttonReset, 'click', function () {
            disabilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
            $.getScript("./inizializza_database.js")
                .done(function (script, textStatus) {
                    console.log("Inizializzazione database completata");
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("Errore nell\'inizializzazione del database!");
                });
            nascondiReset = true;
            buttonReset.disabled = true;
        });
        return buttonReset;
    }
});

var inizializza = (new btnReset()).addTo(mymap);

L.DomEvent.on(mymap, "dialog:closed", function () {
    abilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonDistanzaMaxRastrelliera, buttonAttivazioni, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile, buttonAddGeofenceFromFile]);
});

function disabilitaPulsanti(arrayBottoni) {
    for (let bottone of arrayBottoni) {
        bottone.disabled = true;
    }
}

function abilitaPulsanti(arrayBottoni) {
    for (let bottone of arrayBottoni) {
        bottone.disabled = false;
    }
}

function rimuoviDragBottone(bottone) {
    // Disable dragging when user's cursor enters the element
    bottone.addEventListener('mouseover', function () {
        mymap.dragging.disable();
    });

// Re-enable dragging when user's cursor leaves the element
    bottone.addEventListener('mouseout', function () {
        mymap.dragging.enable();
    });
}