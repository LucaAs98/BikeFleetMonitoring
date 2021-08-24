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

/**** CARICA RASRELLIERE *****/
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
//Bottone per aggiungere rastrelliere da file
var btnAddRastrelliereFromFile = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'Aggiungi rastrelliere');
        button.innerHTML = 'Aggiungi rastrelliere da file';
        L.DomEvent.on(button, 'click', function () {
            var options = {
                size: [400, 150],
                minSize: [100, 100],
                maxSize: [350, 350],
                anchor: [100, 700],
                position: "topleft",
                initOpen: true
            }
            var dialog = L.control.dialog(options)
                .setContent(
                    '<form enctype="multipart/form-data"  id="formFile" action="/rastrelliere_file" method="POST">' +
                    '<input type="file" name="file" id="file" required>' +
                    '<button onclick="doupload()" name="submit">Upload File</button>' +
                    '</form>\n'
                ).addTo(mymap);
            dialog.hideResize();
            dialog.freeze();
            dialog.open();
        });
        return button;
    }
});

var addRastrelliere = (new btnAddRastrelliereFromFile()).addTo(mymap);

function doupload() {
    let entry = document.getElementById("file").files[0];
    console.log('doupload', entry)
    if (entry === undefined) {
        alert('Non hai selezionato nessun file da caricare!');
    }
}


/**** STORICO TRAGITTI *****/

//Bottone per vedere lo storico dei tragitti
var btnViewStorico = L.Control.extend({
    onAdd: function () {
        let nascondiStorico = false;
        var button = L.DomUtil.create('button', 'Storico');
        button.innerHTML = 'Visualizza storico tragitti';
        L.DomEvent.on(button, 'click', function () {
            if (!nascondiStorico) {
                button.innerHTML = 'Nascondi tragitto';
                $.getScript("./get_storico.js")
                    .done(function (script, textStatus) {
                        console.log("Caricamento storico completato");
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Errore nel caricamento storico tragitti");
                    });
                nascondiStorico = true;
            } else {
                button.innerHTML = 'Visualizza storico tragitti';
                mymap.removeLayer(window.layerStorico);
                nascondiStorico = false;
            }
        });
        return button;
    }
});

var viewStorico = (new btnViewStorico()).addTo(mymap);


/**** BICI REAL-TIME *****/
window.abortLoopBikesRealTime = false;

//Bottone per vedere gli utenti in real time
var btnViewBikesRealTime = L.Control.extend({
    onAdd: function () {
        // set timeout
        var tid;

        let nascondiBiciRealTime = false;
        var button = L.DomUtil.create('button', 'Bici tempo reale')
        button.innerHTML = 'Visualizza bici noleggiate in tempo reale';
        L.DomEvent.on(button, 'click', function () {
            if (!nascondiBiciRealTime) {
                window.abortLoopBikesRealTime = false;
                button.innerHTML = 'Nascondi bici noleggiate in tempo reale';
                tid = setTimeout(getScriptBikeRealTime, 500);
                nascondiBiciRealTime = true;
            } else {
                button.innerHTML = 'Visualizza bici noleggiate in tempo reale';
                window.abortLoopBikesRealTime = true;
                mymap.removeLayer(window.layerBiciRealTime);
                nascondiBiciRealTime = false;
            }
        });
        return button;
    }
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


/**** SIMULAZIONE *****/
var buttonSimulazione = L.DomUtil.create('button', 'Simulazione');

//Bottone per avviare la simulazione
var btnSimulazione = L.Control.extend({
    onAdd: function () {
        var buttonSimulazione = L.DomUtil.create('button', 'Simulazione');
        buttonSimulazione.innerHTML = 'Avvia Simulazione';
        L.DomEvent.on(buttonSimulazione, 'click', function () {
            buttonSimulazione.innerHTML = 'Simulazione avviata!';
            $.getScript("./start_simulation.js")
                .done(function (script, textStatus) {
                    console.log("Simulazione avviata!");
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("Errore nell'avvio della simulazione!");
                });
            buttonSimulazione.disabled = true;
        });
        return buttonSimulazione;
    }
});

var viewSimulazione = (new btnSimulazione()).addTo(mymap);


/**** CLUSTERING *****/
var buttonClustering = L.DomUtil.create('button', 'Clustering');
var maxCluster = 10;
var dialogNumClusters;

//Options per il dialog che si apre quando premiamo il bottone per clusterizzare
var optionsDialogCluster = {
    size: [400, 150],
    minSize: [100, 100],
    maxSize: [350, 350],
    anchor: [100, 700],
    position: "topleft",
    initOpen: true
}

//Dialogo per inserire il numero di cluster da fare
dialogNumClusters = L.control.dialog(optionsDialogCluster).setContent('<label> Numero di cluster: </label></br>' +
    '<input type="number" name="number_cluster" id="number_cluster" value="3" max="' + maxCluster + '" required>' +
    '<button onclick="avviaScriptClustering()">Avvia</button>')

//Bottone per avviare il clustering delle bici
var btnClustering = L.Control.extend({
    onAdd: function () {
        let nascondiClustering = false;   //Variabile per capire se il pulsante è stato attivato o meno
        buttonClustering.innerHTML = 'Avvia Clustering';
        L.DomEvent.on(buttonClustering, 'click', function () {
            if (!nascondiClustering) {
                //Entriamo qui quando è stato iniziato il clustering
                buttonClustering.innerHTML = 'Termina clustering';
                dialogNumClusters.addTo(mymap);             //Aggiungiamo il dialog alla pagina
                dialogNumClusters.hideResize();
                dialogNumClusters.freeze();
                dialogNumClusters.open();
                buttonClustering.disabled = true;           //Disabilitiamo  il bottone fino a quando non ha messo il numero di cluster
                nascondiClustering = true;
            } else {
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
    window.numberOfClusters = document.getElementById('number_cluster').value;  //Prendiamo il numero di cluster che l'utente ha scelto per il KMEANS

    //Se l'utente inserisce troppi cluster diamo errore, altrimenti (vedi else)
    if (document.getElementById('number_cluster').value > maxCluster) {
        alert("Non puoi inserire una suddivisione in cluster maggiore di " + maxCluster + "!");
    } else {
        //Rimuoviamo il dialog
        dialogNumClusters.remove();
        mymap.removeLayer(dialogNumClusters);

        //Avviamo lo script per clusterizzare
        $.getScript("./get_clustering.js")
            .done(function (script, textStatus) {
                console.log("Clustering avviato!");
                buttonClustering.disabled = false;
            })
            .fail(function (jqxhr, settings, exception) {
                console.log("Errore nella visualizzazione del clustering!");
            });
    }
}


/**** INTENSITA' ATTIVAZIONI GEOFENCE *****/
var btnViewAttivazioni = L.Control.extend({
    onAdd: function () {
        let nascondiAttivaz = false;
        var buttonAttivazioni = L.DomUtil.create('button', 'Attivazioni');
        buttonAttivazioni.innerHTML = 'Visualizza intensità attivazioni geofence';
        L.DomEvent.on(buttonAttivazioni, 'click', function () {
            if (!nascondiAttivaz) {
                buttonAttivazioni.innerHTML = 'Nascondi intensità attivazioni geofence';
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
var btnReset = L.Control.extend({
    onAdd: function () {
        let nascondiReset = false;
        var buttonReset = L.DomUtil.create('button', 'Inizializza');
        buttonReset.innerHTML = 'Resetta database';
        L.DomEvent.on(buttonReset, 'click', function () {
            if (!nascondiReset) {
                $.getScript("./inizializza_database.js")
                    .done(function (script, textStatus) {
                        console.log("Inizializzazione database completata");
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Errore nell\'inizializzazione del database!");
                    });
                nascondiReset = true;
                buttonReset.disabled = true;
            }
        });
        return buttonReset;
    }
});

var inizializza = (new btnReset()).addTo(mymap);