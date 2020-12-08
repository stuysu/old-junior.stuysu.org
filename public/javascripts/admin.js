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
 * not anymore it looks more bearable now
 */
function addLinkToPage(id, alias, url) {

    // get table body
    const mainLinks = document.getElementById('main-links');
	var link = {id, alias, url};
	console.log(link);
	mainLinks.innerHTML +=
	eval('`' +
	('<tr id="<%=link.id%>-thread"> \
        <th scope="col"><a id="<%=link.id%>-link" href="<%= link.url %>" target="_blank"><%= link.alias %></a></th> \
        <td><input type="text" class="form-control" id="<%=link.id%>-alias" value="<%= link.alias %>" oninput="updatePreview(\'<%= link.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=link.id%>-url" value="<%= link.url %>" oninput="updatePreview(\'<%= link.id %>\')" /></td>  \
        <td id="<%=link.id%>-update"><button class="btn btn-primary" onclick="updateLink(\'<%= link.id %>\')">Update</button></td> \
		<td id="<%=link.id%>-remove"><button class="btn btn-danger" onclick="removeLink(\'<%= link.id %>\')">&times;</button></td>\
    </tr>').replaceAll('<%=', '${').replaceAll('%>','}') +
	'`');
}