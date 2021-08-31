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
const clustering = require("density-clustering");

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
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}))
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

/*Ad URL "/bici_fuori_range" avremo bici che risiedono al di fuori di una certa distanza dalla rastrelliera di partenza.*/
app.get("/bici_fuori_range", async (req, res) => {
    var response = await getBiciFuoriRange(req.query.distanza).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nella ricerca delle bici fuori range!.' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
})

app.get("/n_rastrelliere", async (req, res) => {
    var response = await getNRastrelliere().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nel conteggio delle rastrelliere!.' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
})

app.get("/pos_rastr", async (req, res) => {
    var response = await getPosRastr(req.query.id).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nel trovare la poszione della rastrelliera!' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
})

app.get("/get_dati_noleggio", async (req, res) => {
    var response = await getDatiNoleggio(req.query.codice_noleggio).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nel trovare i dati del noleggio! ' + '\n' + errore_completo);
    } else {
        res.json(response.rows)
    }
})

app.get("/insert_delay", async (req, res) => {
    var response = await insertDelay(req.query.delay, req.query.user).catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nell\'inserimento del delay!' + '\n' + errore_completo);
    } else {
        console.log('Inserimento del ritardo avvenuto con successo!')
    }
})

app.get("/stats_delay", async (req, res) => {
    var response = await statsDelay().catch((err) => errore_completo = err);

    if (!response) {
        console.log('Errore nel calcolo delle statistiche!' + '\n' + errore_completo);
    } else {
        res.json(response.rows);
    }
})

/*** Richieste POST ***/
/* Facendo una richiesta "POST" ad URL "/prenota" si effettua il noleggio di una bici con i dati passati al body. */

app.post("/prenota", (req, res) => {

    client.query('INSERT INTO noleggio(codice, bicicletta, utente, data_inizio, iniziato) VALUES(' + apice + req.body.cod + apice + ',' + req.body.bici + ',' + apice + req.body.utente + apice + ',' + apice + req.body.di + apice + ',' + false + ')', (err, result) => {
        if (err) {
            console.log('Errore durante la prenotazione!' + err);
        } else {
            console.log('Prenotazione effettuata!');
        }
    });

    res.end();
});

/* Facendo una richiesta "POST" ad URL "/rastrelliere_marker" si aggiunge tramite disegno una rastrelliera. */
app.post("/rastrelliere_marker", (req, res) => {
    query_insert = 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + req.body.name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + ')) ON CONFLICT ON CONSTRAINT rastrelliere_name_key DO NOTHING;'
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
        query_insert += 'INSERT INTO rastrelliere(name, geom) VALUES (' + apice + name + apice + ', ST_GeomFromText(' + apice + 'POINT(' + long + ' ' + lat + ')' + apice + ')) ON CONFLICT ON CONSTRAINT rastrelliere_name_key DO NOTHING;';
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

    let vietata;
    vietata = req.body.geoVietata === undefined;
    query_insert = 'INSERT INTO geofence(name, geom, message, vietata) VALUES (' + apice + req.body.name + apice +
        ', ST_GeomFromGeoJSON(' + apice + req.body.geom + apice + ') , ' + apice + req.body.message + apice + ',' + vietata+');'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere la geofence!');
        } else {
            /* Riprendo le geofence e se non ci sono stati errori rivado alla home. */
            var response = await getAllGeofences().catch((err) => errore_completo = err);

            if (!response) {
                console.log('Errore, non sono riuscito a caricare le geofence.' + '\n' + errore_completo);
            } else {
                console.log('Geofence aggiunta!');
                res.redirect('/home');
            }
        }
    });
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
    res.end();
});

/* Facendo una richiesta "POST" ad URL "/addPosizione" si aggiorna la posizione della bicicletta ogni tot. secondi di tempo.  */
app.post("/addPosizione", async (req, res) => {
    query_insert = 'UPDATE bicicletta SET posizione = ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + ') WHERE id = ' + req.body.id + ';'
    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore non sono riuscito ad aggiungere la posizione!' + err);
        } else {
            console.log('Posizione aggiunta!');
            res.json(result.rows);
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
            console.log('Noleggio avviato');
        }
    });
    res.end();
});

/* Facendo una richiesta "POST" ad URL "/termina_noleggio" se tutte le query scritte non danno problemi si fa terminare il noleggio
* di una determinata bici. É particolare perchè viene effettuata una transizione. */
app.post("/termina_noleggio", async (req, res) => {
    try {
        await client.query('BEGIN')
        const query1 = 'INSERT INTO storico VALUES (' + apice + req.body.codNoleggio + apice + ', ST_GeomFromGeoJSON(' + apice + '{"type":"LineString","coordinates":' + req.body.geom + '}' + apice + '))';
        await client.query(query1);
        const query2 = 'DELETE FROM lista_bici_rastrelliera WHERE bicicletta =' + req.body.bici + ';'
        await client.query(query2);
        const query3 = 'INSERT INTO lista_bici_rastrelliera VALUES (' + req.body.rastrelliera + ', ' + req.body.bici + ')'
        await client.query(query3)
        const query4 = 'UPDATE bicicletta set posizione = rastrelliere.geom from rastrelliere where rastrelliere.id =' + req.body.rastrelliera + ' and bicicletta.id = ' + req.body.bici;
        await client.query(query4)
        const query5 = 'UPDATE noleggio set data_fine = ' + apice + req.body.df + apice + ' where noleggio.codice = ' + apice + req.body.codNoleggio + apice + ';'
        await client.query(query5)
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        console.log('Terminazione errata del noleggio !' + e);
    }
    console.log('Terminazione noleggio avvenuta con successo')
    res.end();
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

/* Facendo una richiesta "POST" ad URL "/cancella_prenotazione" si rimuove la prenotazione dal db. */
app.post("/popola_rastrelliere", async (req, res) => {
    query_insert = 'DELETE FROM noleggio WHERE codice = ' + apice + req.body.cod_prenotazione + apice + ';';

    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore nella cancellazione della prenotazione.' + '\n' + errore_completo);
        } else {
            console.log('Cancellazione prenotazione effettuata');
        }
    });
});

app.post("/clustering", async (req, res) => {
    var dataset = req.body;
    var k_clusters = parseInt(dataset.numClusters);
    dataset = dataset.lat.map((e, i) => [parseFloat(e), parseFloat(dataset.long[i])]);


    var clustering = require('density-clustering');
    var kmeans = new clustering.KMEANS();
    var clusters = kmeans.run(dataset, k_clusters);

    var i = 0;
    var newDataset = [];

    for (arrs of clusters) {
        for (arr of arrs) {
            newDataset.push({
                id: arr + 1,
                long: dataset[arr][1],
                lat: dataset[arr][0],
                cluster: i
            });
        }
        i += 1;
    }
    const JSONClusters = JSON.parse(JSON.stringify(Object.assign({}, newDataset)));
    res.json(JSONClusters);
});

app.post("/delete_inizializzazione", async (req, res) => {
    query_insert = 'TRUNCATE TABLE bicicletta RESTART IDENTITY CASCADE; DELETE FROM lista_bici_rastrelliera; DELETE FROM noleggio; DELETE FROM storico; DELETE FROM utente;';

    client.query(query_insert, async (err, result) => {
        if (err) {
            console.log('Errore nella cancellazione dell\'inizializzazione del database! ' + '\n' + err + '\n' + err.detail);
        } else {
            console.log('Cancellazione in inizializzazione del database andata a buon fine!');
        }
    });
    res.end();
});

//inserimento della bici nel database e poi viene assegnata a una rastrelliera
app.post("/inizializza_database", async (req, res) => {

    try {
        await client.query('BEGIN')
        const query1 = 'INSERT INTO bicicletta(posizione) VALUES (ST_GeomFromText(' + apice + 'POINT(' + req.body.long + ' ' + req.body.lat + ')' + apice + '));'
        await client.query(query1);
        const query2 = 'INSERT INTO lista_bici_rastrelliera(rastrelliera, bicicletta) VALUES (' + req.body.id + ', ' + req.body.id_bici + ');'
        await client.query(query2);
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        console.log('Terminazione errata del noleggio !' + e);
    }
    res.json({})

});


/* Metodi per prendere dal DB ciò che ci serve. Ritorna poi alla get che l'ha chiamata, in modo tale da controllare se
* ci sono stati errori altrimenti stampa nella pagina le righe della query trasformate in JSON. */
function getRastrelliere() {
    return client.query('SELECT id, name, ST_X(geom) AS long, ST_Y(geom) AS lat FROM public.rastrelliere;');
}

function getGeofences() {
    return client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM geofence WHERE vietata = false');
}

function getGeofencesVietate() {
    return client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM areevietate_geofence where vietata = true');
}

function getAllGeofences(){
    return client.query('SELECT name, ST_AsGeoJSON(geom) AS geometry FROM geofence');
}

function getUsers() {
    return client.query('SELECT * FROM utente;');
}

function getListaBici(id) {
    return client.query('SELECT bicicletta AS id FROM public.lista_bici_rastrelliera WHERE rastrelliera = ' + id + '' +
        ' and bicicletta not in (select noleggio.bicicletta\n' +
        ' FROM bicicletta, noleggio\n' +
        ' WHERE noleggio.bicicletta = bicicletta.id\n' +
        ' AND codice NOT IN (SELECT noleggio FROM storico)\n' +
        ' )\n' +
        ' order by id;');
}

function getPrenotazione(cod_u) {
    return client.query('SELECT codice, bicicletta, iniziato FROM noleggio WHERE utente =' + cod_u + '  AND codice NOT IN  (SELECT noleggio FROM storico)');
}

function getRastrellieraVicino(longitudine, latitudine) {

    let query1 = 'SELECT a1.id FROM rastrelliere AS A1 WHERE ST_Distance(A1.geom::geography, ST_GeomFromText(' +
        apice + 'POINT(' + longitudine + ' ' + latitudine + ')' + apice + ')::geography) <= 75 order by ' +
        'ST_Distance(A1.geom::geography, ST_GeomFromText(' +
        apice + 'POINT(' + longitudine + ' ' + latitudine + ')' + apice + ')::geography)';

    return client.query(query1);

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
    return client.query('SELECT ST_AsGeoJSON(traiettoria) AS geometry,  noleggio AS codice FROM storico');
}

function getBiciRealTime() {
    return client.query('SELECT ST_X(posizione) AS long, ST_Y(posizione) AS lat, bicicletta.id FROM bicicletta, noleggio WHERE noleggio.iniziato = true AND noleggio.bicicletta = bicicletta.id AND codice NOT IN (SELECT noleggio FROM storico)');
}

function getBiciFuoriRange(distanza) {
    return client.query('SELECT bicicletta.id\n' +
        '    FROM bicicletta, noleggio, rastrelliere, lista_bici_rastrelliera as lbr\n' +
        '    WHERE noleggio.iniziato = true\n' +
        '    AND lbr.bicicletta = bicicletta.id\n' +
        '    AND lbr.rastrelliera = rastrelliere.id\n' +
        '    AND noleggio.bicicletta = bicicletta.id\n' +
        '    AND codice NOT IN (SELECT noleggio FROM storico)\n' +
        '    and ST_DistanceSphere(rastrelliere.geom, bicicletta.posizione) > ' + distanza + ';'
    )
}

function getNRastrelliere() {
    return client.query('select count(*)as n_rastrelliere from rastrelliere;')
}

function getPosRastr(id) {
    return client.query('SELECT ST_X(geom) AS long, ST_Y(geom) AS lat FROM rastrelliere WHERE rastrelliere.id = ' + id);
}

function getDatiNoleggio(codiceNoleggio) {
    return client.query('SELECT bicicletta, utente, data_inizio, data_fine FROM noleggio WHERE codice =' + apice + codiceNoleggio + apice + '   ORDER BY data_inizio');
}

function insertDelay(delay, user) {
    return client.query('Insert into delay (ritardo, utente) values (' + delay + ', ' + apice + user + apice + ')');
}

function statsDelay() {
    return client.query('select *\n' +
        'from(\n' +
        '\tselect count(*) as numero_delay, round(avg(ritardo),2) as media, utente\n' +
        '\tfrom delay\n' +
        '\tgroup by utente\n' +
        '\tunion\n' +
        '\tselect count(*) as numero_delay, round(avg(ritardo),2) as media, \'Tutti\' as utente\n' +
        '\tfrom delay\n' +
        ') as t1\n' +
        'order by utente');
}

// All'avvio apriamo la home con il browser di default.
open("http://localhost:3000/home");