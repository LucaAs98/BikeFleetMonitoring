var editableLayers = new L.FeatureGroup();
mymap.addLayer(editableLayers);


var MyCustomMarker = L.Icon.extend({
    options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 12),
        iconSize: new L.Point(24, 24),
        iconUrl: 'link/to/image.png'
    }
});

/*var options = {
    position: 'topright',
    draw: {
        polyline: {
            shapeOptions: {
                color: '#f357a1',
                weight: 10
            }
        },
        polygon: {
            allowIntersection: false, // Restricts shapes to simple polygons
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
            },
            shapeOptions: {
                color: '#bada55'
            }
        },
        circle: false, // Turns off this drawing tool
        rectangle: {
            shapeOptions: {
                clickable: false
            }
        },
        marker: {
            icon: new MyCustomMarker()
        }
    },
    edit: {
        featureGroup: editableLayers, //REQUIRED!!
        remove: false
    }
};

var drawControl = new L.Control.Draw(options);
mymap.addControl(drawControl);*/

mymap.on(L.Draw.Event.CREATED, function (e) {

    var type = e.layerType,
        layer = e.layer;

    console.log(type);
    if (type === 'circle') {
        /*** Rimuovere la possibilità di fare cerchi */
    } else if (type === 'marker') {
        var rastrelliera = L.circle(e.layer.getLatLng());
        console.log(rastrelliera.toGeoJSON());
        layer.bindPopup('<h3>Per continuare inserisci il nome della rastrelliera: </h3>' +
            ' <form action="/????">\n' +
            '  <label for="lname">Nome:</label><br>\n' +
            '  <input type="text" id="lname" name="lname" placeholder="Inserisci qui il nome..."><br><br>\n' +
            '  <input type="submit" value="Crea rastrelliera">\n' +
            '</form> \n');

        layer.on("add", function (event) {
            event.target.openPopup();
        });
        /** Aggiungi il punto al db se ha inserito tutti i dati corretti
         *
         *
         *
         * */
    } else {
        var polygon = L.polygon(e.layer.getLatLngs());
        console.log(polygon.toGeoJSON());

        layer.bindPopup('<h3>Per continuare inserisci il nome della geofence: </h3>' +
            ' <form action="/????">\n' +
            '  <label for="lname">Nome:</label><br>\n' +
            '  <input type="text" id="lname" name="lname" placeholder="Inserisci qui il nome..."><br><br>\n' +
            '  <input type="submit" value="Crea geofence">\n' +
            '</form> \n');

        layer.on("add", function (event) {
            event.target.openPopup();
        });
        /** Aggiungi il poligono al db
         *
         *
         *
         * */


    }

    editableLayers.addLayer(layer);
});
