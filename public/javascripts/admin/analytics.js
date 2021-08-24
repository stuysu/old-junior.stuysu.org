async function resetViews(url) {

    let response = await sfetch("/api/analytics/reset", {
        method: "PUT",
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            url: url
        })
    });

    if (response.error) {
       alertManager.addAlert("Failure", "received an error from the server", 'danger');
    } else {

        alertManager.addAlert("Success", "reset views to zero", 'success');
        console.log(response.reset);

        document.getElementById(`${url}-num-views`).innerHTML = '0';

    }

}

async function toggleTracking(url) {

    let response = await sfetch("/api/analytics/toggle", {
        method: "PUT",
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            url: url
        })
    });

    if (response.error) {
       alertManager.addAlert("Failure", "received an error from the server", 'danger');
    } else {

        alertManager.addAlert("Success", (response.tracking) ? "turned on tracking" : "turned off tracking", 'success');
        console.log(response);

        document.getElementById(`${url}-toggle-button`).innerHTML = (response.tracking) ? "Stop tracking" : "Start tracking"

    }

}

async function updateInfo() {

    let response = await sfetch("/api/analytics");

    if (response.error) {
        alertManager.addAlert("Failure", "received an error from the server", 'danger');
    }

    else {

        alertManager.addAlert("Success", "updated info", 'success');

        for (let route of response) {
            
            document.getElementById(`${route.url}-num-views`).innerHTML = route.views;
            document.getElementById(`${route.url}-toggle-button`).innerHTML = (route.tracking) ? "Stop tracking" : "Start tracking"
     
        }
    }

}