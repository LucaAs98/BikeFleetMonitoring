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

$.getScript("./draw.js")
    .done(function (script, textStatus) {
        console.log("Caricamento disegno completato");
    })
    .fail(function (jqxhr, settings, exception) {
        console.log("Errore nel caricamento disegno");
    });


//Bottone per aggiungere geofence da file
var btnAddGeofenceFromFile = L.Control.extend({
    onAdd: function () {
        var button = L.DomUtil.create('button', 'Aggiungi geofence');
        button.innerHTML = 'Aggiungi geofence da file';
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
                    '<form enctype="multipart/form-data"  id="formFile" action="/home" method="POST">' +
                    '<input type="file" name="file" id="file" required>' +
                    '<button onclick="doupload()" name="submit">Upload File</button>' +
                    '</form>\n'
                )
                .addTo(mymap);
            dialog.open();
        });
        return button;
    }
});
var closeControl = (new btnAddGeofenceFromFile()).addTo(mymap);

function doupload() {
    let entry = document.getElementById("file").files[0];
    console.log('doupload', entry)
    if (entry === undefined) {
        alert('Non hai selezionato nessun file da caricare!');
    }

}