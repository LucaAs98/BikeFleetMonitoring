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
        console.log('Utenti caricati con successo' + '\n');
    }
});

/* Ad URL "/storico" avremo il JSON di tutte lo storico dei percorsi. */
app.get("/storico", async (req, res) => {
    var response = await getStorico().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare lo storico dei tragitti.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
});

/* Ad URL "/bici_real_time" avremo il JSON di tutte le bici noleggiate in real time. */
app.get("/bici_real_time", async (req, res) => {
    var response = await getBiciRealTime().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare le bici noleggiate in real time.' + '\n' + errore_completo);
    } else {
        console.log('Caricate le bici noleggiate in real time.');
        res.json(response.rows);
    }
});

/* Ad URL "/lista_bici" avremo il JSON di tutte le bici riferite ad una determinata rastrelliera. */
app.get("/lista_bici", async (req, res) => {
    var response = await getListaBici(req.query.id).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare la lista delle bici.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
        console.log('Lista delle bici caricata con successo' + '\n');
    }
});

/* Ad URL "/vis_pren" avremo il JSON del codice di prenotazione.*/
app.get("/vis_pren", async (req, res) => {
    var response = await getPrenotazione(apice + req.query.cod_u + apice).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore, non sono riuscito a caricare il codice della prenotazione.' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
        console.log('Codice della prenotazione caricato con successo' + '\n');
    }
});

/* Ad URL "/checkDistance" avremo l'id della rastrelliera a meno di 5 metri dall'utente. */
app.get("/checkDistance", async (req, res) => {
    var response = await getRastrellieraVicino(req.query.lng, req.query.lat).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nel ritrovamento della rastrelliera vicino all\'utente!' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
});

/* Ad URL "/rastrelliera_corrispondente" avremo l'id della rastrelliera in cui è contenuta una determinata bici. */
app.get("/rastrelliera_corrispondente", async (req, res) => {
    var response = await getRastrellieraFromBici(req.query.bici).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nella ricerca della rastrelliera!.' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
});

/* Ad URL "/intersezione_geofence" avremo la geofence intersecata dall'utente.*/
app.get("/intersezione_geofence", async (req, res) => {
    var response = await getIntersezioneGeofence(req.query.lng, req.query.lat).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nella ricerca di una geofence intersecata!.' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
});
/*** Richieste POST ***/
/* Facendo una richiesta "POST" ad URL "/prenota" si effettua il noleggio di una bici con i dati passati al body. */
app.post("/prenota", (req, res) => {
    client.query('INSERT INTO noleggio(codice, bicicletta, utente, data_inizio, data_fine, iniziato) VALUES(' + apice + req.body.cod + apice + ',' + req.body.bici + ',' + apice + req.body.utente + apice + ',' + apice + req.body.di + apice + ',' + apice + req.body.df + apice + ',' + false + ')', (err, result) => {
        if (err) {
            console.log('Errore durante la prenotazione!' + err);
        } else {
            console.log('Prenotazione effettuata!');
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/rastrelliere_marker" si aggiunge tramite disegno una rastrelliera. */
app.post("/rastrelliere_marker", (req, res) => {
    query_insert = 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + ')) ON CONFLICT ON CONSTRAINT name DO NOTHING;'
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
        query_insert += 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + long + ' ' + lat + ')' + apice + ')) ON CONFLICT ON CONSTRAINT name DO NOTHING;';
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

/* Facendo una richiesta "POST" ad URL "/registrazione" si aggiunge un utente al database. */
app.post("/registrazione", (req, res) => {
    query_insert = 'INSERT INTO utente(username, password) VALUES (' + apice + req.body.username + apice + ',' + apice + req.body.password + apice + ');'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere l\'utente!' + err);
        } else {
            console.log('Utente aggiunto!');
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/addPosizione" si aggiorna la posizione della bicicletta ogni tot. secondi di tempo.  */
app.post("/addPosizione", (req, res) => {
    query_insert = 'UPDATE bicicletta SET posizione = ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + ') WHERE id = ' + req.body.id + ';'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere la posizione!' + err);
        } else {
            console.log('Posizione aggiunta!');
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/avvia_noleggio" si aggiorna lo stato del noleggio di una bicicletta in particolare
 e successivamente si cancella tale bici dalla rastrelliera in cui era contenuta. */
app.post("/avvia_noleggio", (req, res) => {
    query_insert = 'UPDATE noleggio SET iniziato = ' + true + ' where codice = ' + apice + req.body.codNoleggio + apice + ';'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore nel settare il noleggio come iniziato!' + err);
        } else {
            query_insert = 'DELETE FROM lista_bici_rastrelliera WHERE bicicletta =' + req.body.bici + ';'
            client.query(query_insert, async (err, result) => {
                if (err) {
                    console.log('Errore nella cancellazione della bici dalla rastrelliera!' + err);
                } else {
                    console.log('Bici uscita dalla rastrelliera!');
                }
            });
            console.log('Noleggio avviato');
        }
    });
});

/* Facendo una richiesta "POST" ad URL "/termina_noleggio" se tutte le query scritte non danno problemi si fa terminare il noleggio
* di una determinata bici. É particolare perchè viene effettuata una transizione. */
app.post("/termina_noleggio", async (req, res) => {
    try {
        await client.query('BEGIN')
        const query1 = 'INSERT INTO storico VALUES (' + apice + req.body.codNoleggio + apice + ', ST_GeomFromGeoJSON(' + apice + '{"type":"LineString","coordinates":' + req.body.geom + '}' + apice + '))';
        await client.query(query1);
        const query3 = 'INSERT INTO lista_bici_rastrelliera VALUES (' + req.body.rastrelliera + ', ' + req.body.bici + ')'
        await client.query(query3)
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        console.log('Terminazione errata del noleggio !' + e);
    }
    console.log('Terminazione noleggio avvenuta con successo')
});

/* Facendo una richiesta "POST" ad URL "/cancella_prenotazione" si rimuove la prenotazione dal db. */
app.post("/cancella_prenotazione", async (req, res) => {
    query_insert = 'DELETE FROM noleggio WHERE codice = ' + apice + req.body.cod_prenotazione + apice + ';';

    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore nella cancellazione della prenotazione.' + '\n' + errore_completo);
        } else {
            console.log('Cancellazione prenotazione effettuata');
        }
    });
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

function getPrenotazione(cod_u) {
    return client.query('SELECT codice, bicicletta, iniziato FROM noleggio WHERE utente =' + cod_u + '  AND codice NOT IN  (SELECT noleggio FROM storico)');
}

function getRastrellieraVicino(longitudine, latitudine) {

    return client.query('SELECT a1.id FROM rastrelliere AS A1 WHERE ST_Distance(A1.geom::geography, ST_GeomFromText(' +
        apice + 'POINT(' + longitudine + ' ' + latitudine + ')' + apice + ')::geography) <= 15 order by ' +
        'ST_Distance(A1.geom::geography, ST_GeomFromText(' +
        apice + 'POINT(' + longitudine + ' ' + latitudine + ')' + apice + ')::geography)');

}

function getRastrellieraFromBici(bici) {
    return client.query('SELECT rastrelliera FROM lista_bici_rastrelliera WHERE bicicletta = ' + bici + ';');
}

function getIntersezioneGeofence(longitudine, latitudine) {
    return client.query('Select G1.name,G1.message,G1.vietato  from (SELECT id, name, geom, message,true as vietato FROM areevietate_geofence ' +
        'union  SELECT id, name, geom, message,false as vietato FROM poi_geofence) as G1  where ST_Contains(G1.geom, ST_GeomFromText(' +
        apice + 'POINT(' + longitudine + ' ' + latitudine + ')' + apice + ')::geography::geometry) order by vietato DESC,name ;');


}

function getStorico() {
    return client.query('SELECT ST_AsGeoJSON(traiettoria) AS geometry FROM storico');
}

function getBiciRealTime() {
    return client.query('SELECT ST_X(posizione) AS long, ST_Y(posizione) AS lat FROM bicicletta, noleggio WHERE noleggio.iniziato = true AND noleggio.bicicletta = bicicletta.id AND codice NOT IN (SELECT noleggio FROM storico)');
}

// All'avvio apriamo la home con il browser di default.
open("http://localhost:3000/home");

