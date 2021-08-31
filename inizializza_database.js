inizializzaDatabase();

async function inizializzaDatabase() {
    await fetch('/delete_inizializzazione', {
        method: 'POST',
    });

    const response = await fetch('/rastrelliere');
    let rastrelliereJSON = await response.json();

    for (let ras of rastrelliereJSON) {
        Object.assign(ras, {
            id_bici: -1
        });
    }
    let formBody;
    let cont_bici = 1;
    for (const ras of rastrelliereJSON) {

        for (let i = 0; i < 5; i++) {
            formBody = [];
            ras.id_bici = cont_bici;
            cont_bici += 1;

            for (let elem in ras) {
                let encodedKey = encodeURIComponent(elem);
                let encodedValue = encodeURIComponent(ras[elem]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");

            await fetch('/inizializza_database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody,
            });
        }
    }
    abilitaPulsanti([buttonViewStorico, buttonReset, buttonViewBikesRealTime, buttonAttivazioni, buttonDistanzaMaxRastrelliera, buttonClustering, buttonSimulazione, buttonAddRastrelliereFromFile]);
}