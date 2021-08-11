getBiciRealTime();

async function getBiciRealTime() {
    const response = await fetch('/bici_real_time');
    const data = await response.json();
    if (!window.abortLoopBikesRealTime){
        addRealTime(data);
    }

}

function addRealTime(data) {
    var jsonFeatures = [];

    data.forEach(function (point) {
        var lat = point.lat;
        var lon = point.long;

        var feature = {
            type: 'Feature',
            properties: {
                lat: lat,
                lon: lon,
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            },
        };
        jsonFeatures.push(feature);
    });

    var geoJson = {type: 'FeatureCollection', features: jsonFeatures};

    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    window.layerBiciRealTime = L.geoJson(geoJson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng,{
                icon: greenIcon,
            });
        },
    });
    window.layerBiciRealTime.addTo(mymap);
}