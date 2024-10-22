# Bike Fleet Monitoring 🚲 (Interfaccia web per la visualizzazione dei dati da parte degli amministratori del servizio)

### Descrizione del Progetto
Bike Fleet Monitoring è una piattaforma software context-aware per la gestione di una flotta di biciclette a noleggio, sviluppata per il servizio di mobilità urbana della città di Bologna. La piattaforma consente agli utenti di prenotare biciclette, monitorarne la posizione in tempo reale e fornisce funzionalità avanzate di analisi e gestione tramite geofencing. È composta da:

- Un'app mobile (Android) per gli utenti del servizio.
- Un back-end per la gestione dei dati e delle funzionalità del sistema.
- Un'interfaccia web per la visualizzazione dei dati da parte degli amministratori del servizio.

## Funzionalità

### Funzionalità dell'app mobile
L'app permette agli utenti di:
1. **Autenticazione**: Login tramite username e password.
2. **Visualizzazione delle Rastrelliere**: Mostra sulla mappa le rastrelliere disponibili e le biciclette presenti presso ciascuna di esse.
3. **Prenotazione delle Biciclette**: Consente di prenotare una bici per una data specifica, generando un codice per lo sblocco.
4. **Monitoraggio della Posizione**: Durante il noleggio, invia la posizione GPS dell'utente in tempo reale al back-end tramite dati GEO-JSON.
5. **Notifiche di Geofencing**: Riceve notifiche quando l'utente entra in aree di interesse o aree vietate definite nel sistema.
6. **Terminazione del Noleggio**: L'utente può terminare il noleggio verificando la sua posizione rispetto a una delle rastrelliere.

### Funzionalità del back-end
Il back-end è responsabile di:
- **Gestione degli utenti**: Autenticazione e gestione delle informazioni degli utenti.
- **Gestione delle Posizioni**: Salvataggio e gestione delle traiettorie delle biciclette tramite POSTGRES/POSTGIS e query spaziali.
- **Elaborazione dei Geofence**: Gestione delle aree di interesse (POI) e delle aree vietate per inviare notifiche agli utenti in tempo reale.

### Funzionalità dell'interfaccia web (Front-end)
L'interfaccia web consente agli amministratori di:
1. **Visualizzazione in tempo reale** della posizione delle biciclette e lo storico dei tragitti percorsi.
2. **Monitoraggio dei limiti di copertura**: Verifica che le biciclette si trovino entro un raggio prestabilito dalle rastrelliere.
3. **Popolamento dei Dati**: Caricamento di punti di noleggio e geofence tramite file di input (es. file GEOJSON).
4. **Gestione dei Geofence**: Aggiunta di aree di interesse e aree vietate con messaggi personalizzati per le notifiche.
5. **Analisi Spaziali**: Visualizzazione dell'intensità delle attivazioni dei geofence e clustering delle posizioni delle biciclette usando algoritmi come K-Means.

## Componenti aggiuntive

- **Riconoscimento dell'Attività Utente**: Il sistema è in grado di distinguere automaticamente tra le attività di *biking* e *walking*. Viene inviata una notifica sui POI solo in caso di transizione da *biking* a *walking*.
- **Valutazione delle Prestazioni**: Analisi del ritardo medio tra l'ingresso in un geofence e la ricezione della notifica.
- **Popolamento Dinamico**: Possibilità di aggiungere nuovi geofence e rastrelliere direttamente tramite la GUI del front-end.
- **Integrazione con Simulatore di Mobilità**: Simulazione in tempo reale delle operazioni di prenotazione e mobilità delle biciclette tramite un sistema di waypoint random.

## Tecnologie Utilizzate
- **App mobile**: Sviluppata per Android con supporto alle API di geolocalizzazione e gestione del movimento (Android Location API).
- **Back-end**: Realizzato in [Node.js/Javascript] con database POSTGRES/POSTGIS per la gestione spaziale.
- **Front-end**: Sviluppato con [Leaflet/QGIS] per la visualizzazione delle mappe e dei dati spaziali.
- **Networking**: Utilizzo di API REST per la comunicazione tra client e server, con implementazione di websocket per il monitoraggio in tempo reale.
- **Gestione del Riconoscimento delle Attività**: Sfrutta le librerie di rilevamento delle attività per riconoscere automaticamente lo stato dell'utente (in movimento, fermo, etc.).
