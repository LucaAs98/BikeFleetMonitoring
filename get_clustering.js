getClustering();

async function getClustering() {
    const response = await fetch('/rastrelliere');
    const rastrelliere = await response.json();


    var formBody = [];

    var data;

    data = {
        numClusters: window.numberOfClusters,
    }

    for (var prop in data) {
        var encKey = encodeURIComponent(prop);
        var encValue = encodeURIComponent(data[prop]);
        formBody.push(encKey + "=" + encValue);
    }

    for (let i in rastrelliere) {
        data = {
            lat: rastrelliere[i].lat,
            long: rastrelliere[i].long,
        };

        for (var property in data) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
    }

    formBody = formBody.join("&");


    fetch('/clustering', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody,
    });


    const response2 = await fetch('/get_clustering');
    const data2 = await response2.json();

    console.log(data2);
}