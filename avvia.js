/* In questo script gestiremo tutte le chiamate post e get dell'applicazione (sia WEB che Android).
*  Con le chiamate "get" mettiamo sulla schermata tutti i dati in formato JSON. Esempio: ci servono le rastrelliere in un altro
* script. Cosa facciamo? La fetch dell'url corrispondente a dove abbiamo la get.
* Con le chiamate POST, invece, passiamo i dati da un altro script al database. Vogliamo aggiungere rastrelliere? Facciamo una chiamata POST
* all'URL che ci permette di aggiungerle, ad esempio "/rastrelliere". Successivamente ad ogni richiesta POST si fa una redirect all'URL della home.*/
var apice = "\'";
var errore_completo;
var query_insert = "";

/* Preparazione di nodejs per far funzionare il tutto. */
const {Client} = require('pg')
const express = require("express");
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const open = require('open');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'BikeFleetMonitoring',
    password: '6666',
    port: 5432,
})
const app = express();

client.connect();

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded())
app.use(fileUpload({
    createParentPath: true
}));

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

var set_ip_address = require('set-ip-address')

var eth0 = {
    interface: 'eth0',
    ip_address: '10.0.0.1',
    prefix: 20,
    gateway: '10.0.0.1',
    nameservers: ['8.8.8.8'],
    optional: true // (netplan) - dont wait for interfaces to avoid boot delay
}

var eth1 = {
    interface: 'eth1',
    dhcp: true
}

set_ip_address.configure([eth0, eth1]).then(() => console.log('done writing config files'));


/* Stiamo in ascolto su "localhost:3000". */
app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});


/*** Richieste GET ***/
/* Ad URL "/home" rendirizziamo "home.html". Questo a sua volta chiamerà lo script "home.js" che farà tutte le operazioni
*  sulla mappa. */
app.get("/home", (req, res) => {
    res.render("home.html");
});

/* Ad URL "/rastrelliere" avremo il JSON di tutte le rastrelliere. */
app.get("/rastrelliere", async (req, res) => {
    var response = await getRastrelliere().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare le rastrelliere.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/* Ad URL "/geofence" avremo il JSON di tutte le geofence. */
app.get("/geofence", async (req, res) => {
    var response = await getGeofences().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare le geofence.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/* Ad URL "/geofenceVietate" avremo il JSON di tutte le geofence vietate. */
app.get("/geofenceVietate", async (req, res) => {
    var response = await getGeofencesVietate().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare le geofence vietate.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/* Ad URL "/users" avremo il JSON di tutti gli user. */
app.get("/users", async (req, res) => {
    var response = await getUsers().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare gli utenti.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/* Ad URL "/listabici" avremo il JSON di tutte le bici riferite ad una determinata rastrelliera.*/
app.get("/listabici", async (req, res) => {
    var response = await getListaBici(req.query.id).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare la lista delle bici.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/*** Richieste POST ***/
/* Facendo una richiesta "POST" ad URL "/prenota" si effettua il noleggio di una bici con i dati passati al body. */
app.post("/prenota", (req, res) => {
    client.query('INSERT INTO noleggio(codice, bicicletta, utente, data_inizio, data_fine) VALUES(' + apice + req.body.cod + apice + ',' + req.body.bici + ',' + apice + req.body.utente + apice + ',' + apice + req.body.di + apice + ',' + apice + req.body.df + apice + ')', (err, result) => {
        if (err) {
            console.log('Errore!');
        } else {
            console.log('Prenotazione effettuata!');
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/rastrelliere_marker" si aggiunge tramite disegno una rastrelliera. */
app.post("/rastrelliere_marker", (req, res) => {
    query_insert = 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + '));'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere la rastrelliera!');
        } else {
            /* Riprendo le rastrelliere e se non ci sono stati errori rivado alla home. */
            var response = await getRastrelliere().catch((err) => errore_completo = err);

            if (!response) {
                console.log('Errore, non sono riuscito a caricare le rastrelliere.' + '\n' + errore_completo);
            } else {
                console.log('Rastrelliera aggiunta!');
                res.redirect('/home');
            }
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/rastrelliere_file" si aggiunge tramite file un insieme di rastrelliere. */
app.post("/rastrelliere_file", (req, res) => {
    rastrelliere = JSON.parse(req.files.file.data.toString());
    query_insert = "";
    for (ras of rastrelliere.features) {
        var name = ras.properties.Nome;
        name = name.replace("'", " ")
        var long = ras.geometry.coordinates[0];
        var lat = ras.geometry.coordinates[1];
        query_insert += 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + long + ' ' + lat + ')' + apice + '));';
    }

    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere la rastrelliera!' + err);
        } else {
            /* Riprendo le rastrelliere e se non ci sono stati errori rivado alla home. */
            var response = await getRastrelliere().catch((err) => errore_completo = err);

            if (!response) {
                console.log('Errore, non sono riuscito a caricare le rastrelliere.' + '\n' + errore_completo);
            } else {
                console.log('Rastrelliere aggiunte!');
                res.redirect('/home');
            }
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/geofence" si aggiunge tramite disegno una geofence. All'interno si distingue se
*  è una geofence vietata oppure no. */
app.post("/geofence", (req, res) => {
    if (req.body.geoVietata === undefined) {
        query_insert = 'INSERT INTO poi_geofence(name, geom, message) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromGeoJSON(' + apice + req.body.geom + apice + ') , ' + apice + req.body.message + apice + ');'
        client.query(query_insert, async (err, result) => {
            if (err) {
                console.log('Errore non sono riuscito ad aggiungere la geofence!');
            } else {
                /* Riprendo le geofence e se non ci sono stati errori rivado alla home. */
                var response = await getGeofences().catch((err) => errore_completo = err);

                if (!response) {
                    console.log('Errore, non sono riuscito a caricare le geofence.' + '\n' + errore_completo);
                } else {
                    console.log('Geofence aggiunta!');
                    res.redirect('/home');
                }
            }
        });
    } else {
        query_insert = 'INSERT INTO areevietate_geofence(name, geom, message) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromGeoJSON(' + apice + req.body.geom + apice + ') , ' + apice + req.body.message + apice + ');'
        client.query(query_insert, async (err, result) => {
            if (err) {
                console.log('Errore non sono riuscito ad aggiungere la geofence vietata!');
            } else {
                /* Riprendo le geofence vietate e se non ci sono stati errori rivado alla home. */
                var response = await getGeofencesVietate().catch((err) => errore_completo = err);

                if (!response) {
                    console.log('Errore, non sono riuscito a caricare le geofence vietate.' + '\n' + errore_completo);
                } else {
                    console.log('Geofence vietata aggiunta!');
                    res.redirect('/home');
                }
            }
        });
    }
});

/* Metodi per prendere dal DB ciò che ci serve. Ritorna poi alla get che l'ha chiamata, in modo tale da controllare se
* ci sono stati errori altrimenti stampa nella pagina le righe della query trasformate in JSON. */
function getRastrelliere() {
    return client.query('SELECT id, name, ST_X(geom) AS long, ST_Y(geom) AS lat FROM public.rastrelliere;');
}

function getGeofences() {
    return client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM poi_geofence');
}

function getGeofencesVietate() {
    return client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM areevietate_geofence');
}

function getUsers() {
    return client.query('SELECT * FROM utente;');
}

function getListaBici(id) {
    return client.query('SELECT bicicletta AS id FROM public.lista_bici_rastrelliera WHERE rastrelliera = ' + id + ';');
}


// All'avvio apriamo la home con il browser di default.
open("http://localhost:3000/home");