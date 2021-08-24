getClustering();

async function getClustering() {
    //Prendiamo tutte le bici noleggiate dallo storico dei tragitti
    const response = await fetch('/rastrelliere');
    const rastrelliere = await response.json();


    //Creiamo il body per la richiesta POST a "/clustering
    var formBody = [];

    //Aggiungiamo il numero di cluster da creare
    var data = {
        numClusters: window.numberOfClusters,
    };

    for (var prop in data) {
        var encKey = encodeURIComponent(prop);
        var encValue = encodeURIComponent(data[prop]);
        formBody.push(encKey + "=" + encValue);
    }

    //Aggiungiamo tutte le rastrelliere
    for (let i in rastrelliere) {
        data = {
            lat: rastrelliere[i].lat,
            long: rastrelliere[i].long,
        };

        for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
    }

    formBody = formBody.join("&");


    //Facciamo la richiesta a "/clustering" con tutti i parametri necessari messi nel body
    const jsonClusterResponse = await fetch('/clustering', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });

    /* Salviamo nella variabile "jsonCluster" la risposta alla richiesta POST precedente. Questa variabile
     * conterrà tutte le bici con id, nome e cluster di appartenenza. */
    var jsonCluster = await jsonClusterResponse.json();

    /* Quando visualizziamo il layer delle bici clusterizzate, rimuoviamo le rastrelliere dalla mappa.
     * Verranno reinserite quando terminerà la viuslaizzazione dei cluser di bici. */
    mymap.removeLayer(window.clusterRastrelliere);

    //Array dalla quale andremo a prendere i colori dei cluster. Saranno al massimo dieci divisioni, dunque al massimo dieci colori
    var colore = ["#ff0000", "#F2F230", "#004dff", "#099300", "#00ffd2", "#dd00ff", "#ff9101", "#000000", "#FFFFFF", "#868573"];

    //Array nella quale andremo ad inserire le bici trovate con lo stesso id dei cluster in jsonCluster
    var pointRas = [];

    //Creo cluster da array di bici
    for (let singolaRas of Object.values(jsonCluster)) {
        //singoloRas -> è la singola bici presente in jsonCluster
        rastrelliere.find(function (elem, index) {
            if (elem.id === singolaRas.id) {
                pointRas.push({
                    id: elem.id,
                    long: elem.long,
                    lat: elem.lat,
                    name: elem.name,
                    color: colore[singolaRas.cluster],
                });
            }
        });
    }

    //Creiamo la variabile che conterrà i marker clusterizzati da visualizzare sulla mappa
    var jsonClusterRas = [];

    var iconColor;

    pointRas.forEach(function (point) {
        var lat = point.lat;
        var lon = point.long;
        var name = point.name;
        iconColor = point.color;

        var feature = {
            type: 'Feature',
            properties: {
                lat: lat,
                lon: lon,
                name: name,
                color: iconColor
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            },
        };

        jsonClusterRas.push(feature);
    });

    //Estetica del marker
    function svgTemplate(color) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker">
                    <path fill-opacity=".25" d="M16 32s1.427-9.585 3.761-12.025c4.595-4.805 8.685-.99 8.685-.99s4.044 3.964-.526 8.743C25.514 30.245 16 32 16 32z"/>
                    <path fill=` + color + ` stroke="#000" d="M15.938 32S6 17.938 6 11.938C6 .125 15.938 0 15.938 0S26 .125 26 11.875C26 18.062 15.938 32 15.938 32zM16 6a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>`;
    }

    //Creazione icona del marker
    function icon(color) {
        return L.divIcon({
            className: "marker",
            html: svgTemplate(color),
            iconSize: [40, 40],
            iconAnchor: [12, 24],
            popupAnchor: [7, -16]
        });
    }

    var geoJson = {type: 'FeatureCollection', features: jsonClusterRas};

    //Creazione del marker in base al suo colore (e ovviamente alla sua lat e long). Lo aggiungiamo anche alla mappa.
    window.clusterKMEANS = L.geoJson(geoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: icon(feature.properties.color),
            });
        },
    }).addTo(mymap);

    abilitaPulsanti();
}