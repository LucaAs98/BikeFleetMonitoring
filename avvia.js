var rastrelliere, geofence, geofenceVietate, users;

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
var bodyParser = require('body-parser')
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded())


app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


getRastrelliere();

getGeofences();

getGeofencesVietate();

app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});

app.get("/home", (req, res) => {
    res.render("home.html");
});

app.post("/home", (req, res) => {
    var apice = "\'";
    var query_insert;

    if (req.body.geofence === undefined) {
        query_insert = 'INSERT INTO rastrelliere(NAME, GEOM) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + '));'
        client.query(query_insert, (err, result) => {
            if (err) {
                console.log('Errore non sono riuscito ad aggiungere la rastrelliera!');
            } else {
                console.log('Rastrelliera aggiunta!');
                getRastrelliere();
                res.redirect('/home');
            }
        });
    } else {
        if (req.body.geoVietata === undefined) {
            query_insert = 'INSERT INTO poi_geofence(NAME, GEOM) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromGeoJSON(' + apice + req.body.geom + apice + '));'
            client.query(query_insert, (err, result) => {
                if (err) {
                    console.log('Errore non sono riuscito ad aggiungere la geofence!' + query_insert);
                } else {
                    console.log('Geofence aggiunta!');
                    getGeofences();
                    res.redirect('/home');
                }
            });
        } else {
            query_insert = 'INSERT INTO areevietate_geofence(NAME, GEOM) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromGeoJSON(' + apice + req.body.geom + apice + '));'
            client.query(query_insert, (err, result) => {
                if (err) {
                    console.log('Errore non sono riuscito ad aggiungere la geofence vietata!' + query_insert);
                } else {
                    console.log('Geofence vietata aggiunta!');
                    getGeofencesVietate();
                    res.redirect('/home');
                }
            });
        }
    }
});

app.get("/rastrelliere", (req, res) => {
    getRastrelliere();
    res.json(rastrelliere);
});

app.get("/geofence", (req, res) => {
    getGeofences();
    res.json(geofence);
});

app.get("/geofenceVietate", (req, res) => {
    getGeofencesVietate();
    res.json(geofenceVietate);
});


const open = require('open');

// specify the app to open in
open("http://localhost:3000/home", {app: 'chrome'});


function getRastrelliere() {
    client.query('SELECT name, ST_X(geom) AS long, ST_Y(geom) AS lat FROM public.rastrelliere;', (err, res) => {
        if (err) {
            console.log('Errore, non sono riuscito a caricare le rastrelliere');
        } else {
            rastrelliere = res.rows;
        }
    });
}

function getGeofences() {
    client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM poi_geofence', (err, res) => {
        if (err) {
            console.log('Errore, non sono riuscito a caricare le geofence');
        } else {
            geofence = res.rows;
        }
    });
}

function getGeofencesVietate() {
    client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM areevietate_geofence', (err, res) => {
        if (err) {
            console.log('Errore, non sono riuscito a caricare le geofence delle aree vietate');
        } else {
            geofenceVietate = res.rows;
        }
    });
}

app.get("/users", (req, res) => {
    client.query('SELECT * FROM utente;', (err, result) => {
        if (err) {
            console.log('Errore, non sono riuscito a caricare le rastrelliere');
        } else {
            users = result.rows;
            console.log(users);
            res.json(users);
        }
    });
});