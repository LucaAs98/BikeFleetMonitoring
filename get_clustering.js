getClustering();

async function getClustering() {
    const response = await fetch('/rastrelliere');
    const rastrelliere = await response.json();


    var formBody = [];

    var data;

    data = {
        numClusters: window.numberOfClusters,
    }

    for (var prop in data) {
        var encKey = encodeURIComponent(prop);
        var encValue = encodeURIComponent(data[prop]);
        formBody.push(encKey + "=" + encValue);
    }

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


    const jsonClusterResponse = await fetch('/clustering', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });
    var jsonCluster = await jsonClusterResponse.json();
    console.log(jsonCluster);

    mymap.removeLayer(window.clusterRastrelliere);
    var colore = ["#ff0000", "#F2F230", "#004dff", "#099300", "#00ffd2", "#dd00ff", "#ff9101", "#000000", "#FFFFFF", "#868573"];
    var pointRas = [];

    //Creo cluster da array di bici (Inizialmente proviamo con le rastrelliere)

    for (let singolaRas of Object.values(jsonCluster)) {
        //ras = id di ogni rastrelliera
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

    function svgTemplate(color) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker">
                    <path fill-opacity=".25" d="M16 32s1.427-9.585 3.761-12.025c4.595-4.805 8.685-.99 8.685-.99s4.044 3.964-.526 8.743C25.514 30.245 16 32 16 32z"/>
                    <path fill=` + color + ` stroke="#000" d="M15.938 32S6 17.938 6 11.938C6 .125 15.938 0 15.938 0S26 .125 26 11.875C26 18.062 15.938 32 15.938 32zM16 6a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>`;
    }

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

    window.clusterKMEANS = L.geoJson(geoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: icon(feature.properties.color),
            });
        },
    }).addTo(mymap);
}