getBiciRealTime();

async function getBiciRealTime() {
    const response = await fetch('/bici_real_time');
    const data = await response.json();

    if (!window.abortLoopBikesRealTime) {
        addRealTime(data);
    }
}

async function addRealTime(data) {
    var jsonFeatures = [];

    const responseBiciFuoriRange = await fetch('/bici_fuori_range?distanza=' + distanza);
    const biciFuoriRange = await responseBiciFuoriRange.json();

    data.forEach(function (point) {
        var lat = point.lat;
        var lon = point.long;
        var id = point.id;

        var feature = {
            type: 'Feature',
            properties: {
                lat: lat,
                lon: lon,
                id: id
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            },
        };
        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    window.layerBiciRealTime = L.geoJson(geoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: getIcon(feature),
            });
        },
    });

    function getIcon(feature) {
        var color = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';

        for (var bici of biciFuoriRange) {
            if (bici.id === feature.properties.id) {
                color = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                break;
            }
        }
        return (new L.Icon({
            iconUrl: color,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }));

    }

    mymap.removeLayer(window.layerBiciRealTime);
    window.layerBiciRealTime.addTo(mymap);
}

