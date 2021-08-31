var editableLayers = new L.FeatureGroup();
mymap.addLayer(editableLayers);

L.drawLocal.draw.toolbar.buttons.polygon = 'Disegna la geofence';
L.drawLocal.draw.toolbar.buttons.marker = 'Aggiungi la rastrelliera';

var options = {
    position: 'topright',
    draw: {
        polyline: false,
        polygon: {
            allowIntersection: true, // Restricts shapes to simple polygons
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
            },
            shapeOptions: {
                color: '#bada55'
            }
        },
        circle: false, // Turns off this drawing tool
        rectangle: false,
    },
    edit: false
};

var drawControl = new L.Control.Draw(options);
mymap.addControl(drawControl);

mymap.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType;
    layer = e.layer;

    if (type === 'marker') {
        layer.bindPopup(
            '<h3>Per continuare inserisci il nome della rastrelliera: </h3>' +
            '<form  id="formRastrelliera" action="/rastrelliere_marker" method="POST">\n' +
            '   <label for="lname">Nome:</label><br>\n' +
            '   <input type="text" id="name" name="name" placeholder="Inserisci qui il nome..." required><br><br>\n' +
            '   <input type="hidden" id="long" name="long" value=' + layer.getLatLng().lng + '>' +
            '   <input type="hidden" id="lat" name="lat" value=' + layer.getLatLng().lat + '>' +
            '   <input type="submit" value="Crea rastrelliera">\n' +
            '</form> \n');

        layer.on("add", function (event) {
            event.target.openPopup();
        });

        layer.on("popupclose", function (event) {
            mymap.removeLayer(layer);
        });
    } else {
        var coordinate = getCoordinateFromArray(layer.getLatLngs()[0]).toString();
        var myGeoJSON = {
            type: "Polygon",
            coordinates: JSON.parse("[" + coordinate + "]"),
        }

        layer.bindPopup('<h3>Per continuare inserisci il nome della geofence: </h3>' +
            '<form id="formGeofences" action="/geofence" method="POST">\n' +
            '   <label for="name">Nome:</label><br>\n' +
            '   <input type="text" id="name" name="name" placeholder="Inserisci qui il nome..." required><br><br>\n' +
            '   <textarea id="message" name="message" rows="4" placeholder="Inserisci qui il messaggio da visualizzare quando si entra nella rastrelliera..."></textarea><br><br>\n' +
            '   <input type="hidden" id="geom" name="geom" value=' + JSON.stringify(myGeoJSON) + '>' +
            '   <label for="geoVietata">Vietata:</label>' +
            '   <input type="hidden" id="geofence" name="geofence" value="true">' +
            '   <input type="checkbox" id="geoVietata" name="geoVietata"><br><br>\n' +
            '   <input type="submit" value="Crea geofence">\n' +
            '</form>\n');

        layer.on("add", function (event) {
            event.target.openPopup();
        });

        layer.on("popupclose", function (event) {
            mymap.removeLayer(layer);
        });
    }
    editableLayers.addLayer(layer);
});

function getCoordinateFromArray(arrayLatLng) {
    var StrCoordinate = "["
    for (cella of arrayLatLng) {
        StrCoordinate += "["
        StrCoordinate += cella.lng;
        StrCoordinate += "," + cella.lat;
        StrCoordinate += "],"
    }
    StrCoordinate = StrCoordinate.slice(0, -1) //Rimuovo l'ultima virgola
    StrCoordinate += "]";

    return StrCoordinate;
}


/*function inviaDati(layer) {

    fetch('/rastrelliere', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rastrelliera: {
                lat: layer.getLatLng().lat,
                lng: layer.getLatLng().lng,
                nome:
            }
        })
    });
}*/
