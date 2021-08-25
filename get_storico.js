var jsonFeatures = [];
let storicoEDati = [];
window.storicoLayerAttivi = [];
window.storicoLayerPointsAttivi = [];

var startIcon = L.icon({
    iconUrl: 'icons/iconStart.svg',
    iconSize: [25, 60], // size of the icon
    iconAnchor: [14, 50], // point of the icon which will correspond to marker's location
});

var finishIcon = L.icon({
    iconUrl: 'icons/iconEnd.svg',
    iconSize: [25, 60], // size of the icon
    iconAnchor: [14, 50], // point of the icon which will correspond to marker's location
});

getStorico();

async function getStorico() {
    const response = await fetch('/storico');
    const datiStorico = await response.json();

    addStorico(datiStorico);
}

async function addStorico(datiStorico) {

    datiStorico.forEach(function (lineString) {
        var geometry = JSON.parse(lineString.geometry);

        var feature = {
            type: 'Feature',
            geometry: {
                type: geometry.type,
                coordinates: geometry.coordinates,
                inizio: geometry.coordinates[0],
                fine: geometry.coordinates[geometry.coordinates.length - 1]
            },
            properties: {
                codice: lineString.codice
            }
        };
        jsonFeatures.push(feature);
    });

    let contentSidebar = '<button type="button" onClick="vediTuttiGliStorici()">Visualizza tutti</button>' +
        '<button type="button" onClick="pulisciStorici()">Pulisci storici</button><br>';
    let datiNoleggio = [];
    let responseDatiNoleggio;

    let i = 0;
    let idBottone;
    for (let feature of jsonFeatures) {
        idBottone = "btnVisualizzaStorico" + i;
        responseDatiNoleggio = await fetch('/get_dati_noleggio?codice_noleggio=' + feature.properties.codice);

        datiNoleggio.push(await responseDatiNoleggio.json());

        contentSidebar +=
            '<br>' +
            '<table id="tableDatiNoleggio">' +
            '<span> <b>Bicicletta:</b> ' + datiNoleggio[datiNoleggio.length - 1][0].bicicletta + '</span><br>' +
            '<span> <b>Data inizio:</b> ' + datiNoleggio[datiNoleggio.length - 1][0].data_inizio.slice(0, -14) + '</span>' +
            '<button type="button" class="buttonVisualizzaStorico" id=' + idBottone + ' onClick="visualizzaStorico(\'' + feature.properties.codice + '\', \'' + i + '\')">Visualizza storico</button><br>' +
            '<span> <b>Utente:</b> ' + datiNoleggio[datiNoleggio.length - 1][0].utente + '</span>' +
            '</table>' +
            '<br><br>';

        i++;

        sidebar.setContent(contentSidebar);
    }
}

async function visualizzaStorico(codice, indice) {
    let featuresGeoJson = [];
    let pointsGeoJson = [];
    for (let feature of jsonFeatures) {
        if (feature.properties.codice === codice) {
            let featureStartPoint = {
                type: 'Feature',
                geometry: {
                    type: "Point",
                    coordinates: feature.geometry.coordinates[0],
                },
                feature: {
                    start: true
                }
            };

            let featureEndPoint = {
                type: 'Feature',
                geometry: {
                    type: "Point",
                    coordinates: feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
                },
                feature: {
                    start: false
                }
            };
            featuresGeoJson.push(feature);
            pointsGeoJson.push(featureStartPoint);
            pointsGeoJson.push(featureEndPoint);
        }
    }

    if (!storicoEDati.some(e => e.properties.codice === featuresGeoJson[0].properties.codice)) {
        var geoJson = {type: 'FeatureCollection', features: featuresGeoJson};
        var pointJSON = {type: 'FeatureCollection', features: pointsGeoJson};

        window.layerStorico = L.geoJson(geoJson);
        window.pointStorico = L.geoJson(pointJSON, {
            pointToLayer: function (feature, latlng) {
                console.log(latlng);
                let icon;
                if (feature.feature.start) {
                    icon = startIcon;
                } else {
                    icon = finishIcon;
                }
                return L.marker(latlng, {icon: icon});
            }
        })

        let htmlButton = document.getElementById('btnVisualizzaStorico' + indice);
        let layer = window.layerStorico;
        let layerPoints = window.pointStorico;

        htmlButton.onclick = function () {
            rimuoviLayer(layer, codice, indice, layerPoints)
        };

        htmlButton.textContent = "Nascondi storico";
        window.storicoLayerAttivi.push(layer);
        window.storicoLayerPointsAttivi.push(layerPoints)
        storicoEDati.push(featuresGeoJson[0]);
        window.layerStorico.addTo(mymap);
        window.pointStorico.addTo(mymap);
    }
}

function rimuoviLayer(layer, codice, indice, layerPoints) {
    if (layer !== undefined && checkStoricoDati(codice)) {
        let htmlButton = document.getElementById('btnVisualizzaStorico' + indice);
        htmlButton.onclick = function () {
            visualizzaStorico(codice, indice);
        }
        htmlButton.textContent = "Visualizza storico";

        storicoEDati = storicoEDati.filter(elem => elem.properties.codice !== codice);
        window.storicoLayerAttivi = window.storicoLayerAttivi.filter(elem => elem !== layer);
        window.storicoLayerPointsAttivi = window.storicoLayerPointsAttivi.filter(elem => elem !== layerPoints);
        mymap.removeLayer(layer);
        mymap.removeLayer(layerPoints);
    }
}

function pulisciStorici() {
    let indiceFeature = 0;
    for (let feature of jsonFeatures) {
        rimuoviLayer(window.storicoLayerAttivi[0], feature.properties.codice, indiceFeature, window.storicoLayerPointsAttivi[0]);
        indiceFeature++;
    }
}

function vediTuttiGliStorici() {
    let indiceFeature = 0;
    for (let feature of jsonFeatures) {
        visualizzaStorico(feature.properties.codice, indiceFeature);
        indiceFeature++;
    }
}

function checkStoricoDati(codice) {
    for (let item in storicoEDati) {
        if (storicoEDati[item].properties.codice === codice) {
            return true;
        }
    }
    return false;
}