var rastrelliere, geofence, geofenceVietate;

const {Client} = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'BikeFleetMonitoring',
    password: '6666',
    port: 5432,
})

client.connect();


const express = require("express");
const app = express();

client.query('SELECT name, ST_X(geom) AS long, ST_Y(geom) AS lat FROM public.rastrelliere;', (err, res) => {
    if (err) {
        console.log('Errore');
    } else {
        rastrelliere = res.rows;
        console.log(rastrelliere);
    }
});

client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM poi_geofence', (err, res) => {
    if (err) {
        console.log('Errore');
    } else {
        geofence = res.rows;
    }
});

client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM areevietate_geofence', (err, res) => {
    if (err) {
        console.log('Errore');
    } else {
        geofenceVietate = res.rows;
    }
});

app.use(express.static(__dirname));

app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});


app.get("/rastrelliere", (req, res) => {
    //res.sendFile(__dirname + "/home.html");
    res.json(rastrelliere);
});

app.get("/geofence", (req, res) => {
    //res.sendFile(__dirname + "/home.html");
    res.json(geofence);
});

app.get("/geofenceVietate", (req, res) => {
    //res.sendFile(__dirname + "/home.html");
    res.json(geofenceVietate);
});

const open = require('open');

// specify the app to open in
open("http://localhost:3000/home.html", {app: 'chrome'});
