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

L.control.scale().addTo(mymap);
L.control.layers(baseMaps).addTo(mymap);


$.getScript("./get_rastrelliere.js")
    .done(function (script, textStatus) {
        console.log("Caricamento rastrelliere completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento delle rastrelliere");
    });

$.getScript("./get_intensita_attivazioni.js")
    .done(function (script, textStatus) {
        console.log("Caricamento attivazioni completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento delle attivazioni");
    });


$.getScript("./draw.js")
    .done(function (script, textStatus) {
        console.log("Caricamento disegno completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento disegno");
    });


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

//Bottone per vedere lo storico dei tragitti
var btnViewStorico = L.Control.extend({
    onAdd: function () {
        nascondi = false;
        var button = L.DomUtil.create('button', 'Storico');
        button.innerHTML = 'Visualizza storico tragitti';
        L.DomEvent.on(button, 'click', function () {
            if (!nascondi) {
                button.innerHTML = 'Nascondi tragitto';
                $.getScript("./get_storico.js")
                    .done(function (script, textStatus) {
                        console.log("Caricamento storico completato");
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Errore nel caricamento storico tragitti");
                    });
                nascondi = true;
            } else {
                button.innerHTML = 'Visualizza storico tragitti';
                mymap.removeLayer(window.layerStorico);
                nascondi = false;
            }
        });
        return button;
    }
});

var viewStorico = (new btnViewStorico()).addTo(mymap);


//Bottone per vedere gli utenti in real time
window.abortLoopBikesRealTime = false;

var btnViewBikesRealTime = L.Control.extend({
    onAdd: function () {
        // set timeout
        var tid;

        nascondi = false;
        var button = L.DomUtil.create('button', 'Bici tempo reale')
        button.innerHTML = 'Visualizza bici noleggiate in tempo reale';
        L.DomEvent.on(button, 'click', function () {
            if (!nascondi) {
                window.abortLoopBikesRealTime = false;
                button.innerHTML = 'Nascondi bici noleggiate in tempo reale';
                tid = setTimeout(getScriptBikeRealTime, 500);
                nascondi = true;
            } else {
                button.innerHTML = 'Visualizza bici noleggiate in tempo reale';
                window.abortLoopBikesRealTime = true;
                mymap.removeLayer(window.layerBiciRealTime);
                nascondi = false;
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

//Bottone per avviare la simulazione
var btnSimulazione = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'Simulazione');
        button.innerHTML = 'Avvia Simulazione';
        L.DomEvent.on(button, 'click', function () {
            button.innerHTML = 'Simulazione avviata!';
            $.getScript("./start_simulation.js")
                .done(function (script, textStatus) {
                    console.log("Simulazione avviata!");
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log("Errore nell'avvio della simulazione!");
                });
            button.disabled = true;
        });
        return button;
    }
});

var viewSimulazione = (new btnSimulazione()).addTo(mymap);
var dialogNumClusters;


//Bottone per avviare il clustering delle bici
var btnClustering = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'Clustering');
        button.innerHTML = 'Avvia Clustering';
        L.DomEvent.on(button, 'click', function () {
            button.innerHTML = 'Clustering avviato!';
            var options = {
                size: [400, 150],
                minSize: [100, 100],
                maxSize: [350, 350],
                anchor: [100, 700],
                position: "topleft",
                initOpen: true
            }
            dialogNumClusters = L.control.dialog(options)
                .setContent(
                    '<label> Numero di cluster: </label></br>' +
                    '<input type="number" name="number_cluster" id="number_cluster" value="3" required>' +
                    '<button onclick="avviaScriptClustering()">Avvia</button>'
                ).addTo(mymap);
            dialogNumClusters.hideResize();
            dialogNumClusters.freeze();
            dialogNumClusters.open();
            button.disabled = true;
        });
        return button;
    }
});

var viewClustering = (new btnClustering()).addTo(mymap);

function avviaScriptClustering() {
    window.numberOfClusters = document.getElementById('number_cluster').value;
    dialogNumClusters.close();
    $.getScript("./get_clustering.js")
        .done(function (script, textStatus) {
            console.log("Clustering avviato!");
        })
        .fail(function (jqxhr, settings, exception) {
            console.log("Errore nella visualizzazione del clustering!");
        });
}