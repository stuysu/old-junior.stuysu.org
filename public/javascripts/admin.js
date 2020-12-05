function getInputs(id) {
    return {
        preview: document.getElementById(id + '-link'),
        alias: document.getElementById(id + '-alias'),
        url: document.getElementById(id + '-url'),
        thread: document.getElementById(id + '-thread'),
        update: document.getElementById(id + '-update')
    };
}

async function removeLink(id) {
    const { thread } = getInputs(id);
    
    thread.remove();

    let response = await fetch('/links/' + id, {
        method: 'DELETE', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
    });

    response = await response.json();

    // if response.id is undefined, response failed
    if (response.id) {

        if (response.deleted === false) {

            alertManager.addAlert('Failure', 'did not find a link to delete', 'secondary');
        
        } else {

            alertManager.addAlert('Success', `deleted link`, 'warning');

        }

    } else {

        alertManager.addAlert('Failure', `received an error from the server`, "danger");
    
    }

}

async function updateLink(id) {

    const { alias, url } = getInputs(id);
    let response = await fetch("/links", {
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
            id: id,
            alias: alias.value,
            url: url.value
        })
    });

    response = await response.json(); 

    if (response.error) {

        alertManager.addAlert('Failure', `received an error from the server`, "danger");

    } else {

        if (response.found && (response.updatedUrl || response.updatedAlias)) {
            let changedMessage = '';
            changedMessage += (response.updatedUrl ? (`"${response.old.url}" to "${response.url}"`) : "");
            changedMessage += (response.updatedAlias ? (`${response.updatedUrl ? ", ":""}"${response.old.alias}" to "${response.alias}"`) : "");
            
            alertManager.addAlert('Success', `changed ${changedMessage}`, 'primary');
        } else {
            alertManager.addAlert('', `Entry not found or no changes were made`, 'secondary');
        }

    }

}

async function addLink() {

    const { preview, alias, url } = getInputs('add');

    let response = await fetch("/links", {
        method: "POST",
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            alias: alias.value,
            url: url.value
        })
    });

    response = await response.json();

    if (response.created) {

        addLinkToPage(
            response.id,
            response.alias,
            response.url
        );

        alias.value = '';
        url.value = '';
        preview.innerHTML = '';
    
        alertManager.addAlert('Success', `created "${response.alias}" with redirect to "${response.url}`, "success");

    } else {
        
        alertManager.addAlert('Failure', `failed to create link`, "warning");

    }

}

function updatePreview(id) {
    const { preview, alias, url } = getInputs(id);

    preview.innerHTML = alias.value;
    preview.href = url.value;
}

/**
 * +-+-+-+-+-+-+-+-+
 * ||| LOOK AWAY |||
 * +-+-+-+-+-+-+-+-+
 */
function addLinkToPage(id, alias, url) {

    // get table body
    const mainLinks = document.getElementById('main-links');

    // create table row
    const trow = document.createElement('tr');
    trow.id = id + '-thread';

    // create table header
    const th = document.createElement('th');
    th.scope = 'col';
    const preview = document.createElement('a');
    preview.id = id + '-link';
    preview.href = url;
    preview.innerHTML = alias;
    preview.target = "_blank";
    th.appendChild(preview);

    // create table data
    const tdAlias = document.createElement('td');
    const tdAliasInput = document.createElement('input');
    tdAliasInput.type = 'text';
    tdAliasInput.id = id + '-alias';
    tdAliasInput.value = alias;
    tdAliasInput.classList.add("form-control");
    tdAliasInput.oninput = () => { updatePreview(id) };
    tdAlias.appendChild(tdAliasInput);

    const tdUrl = document.createElement('td');
    const tdUrlInput = document.createElement('input');
    tdUrlInput.type = 'text';
    tdUrlInput.id = id + '-url';
    tdUrlInput.value = url;
    tdUrlInput.classList.add("form-control");
    tdUrlInput.oninput = () => { updatePreview(id) };
    tdUrl.appendChild(tdUrlInput);

    // create update / remove buttons
    const tdUpdate = document.createElement('td');
    tdUpdate.id = id + '-update';
    const tdUpdateButton = document.createElement('button');
    tdUpdateButton.onclick = () => { updateLink(id) };
    tdUpdateButton.innerHTML = "Update";
    tdUpdateButton.classList.add("btn");
    tdUpdateButton.classList.add("btn-primary");
    tdUpdate.appendChild(tdUpdateButton);

    const tdRemove = document.createElement('td');
    tdUpdate.id = id + '-remove';
    const tdRemoveButton = document.createElement('button');
    tdRemoveButton.onclick = () => { removeLink(id) };
    tdRemoveButton.innerHTML = "&times;";
    tdRemoveButton.classList.add("btn");
    tdRemoveButton.classList.add("btn-danger");
    tdRemove.appendChild(tdRemoveButton);

    trow.appendChild(th);
    trow.appendChild(tdAlias);
    trow.appendChild(tdUrl);
    trow.appendChild(tdUpdate);
    trow.appendChild(tdRemove);

    mainLinks.appendChild(trow);

}