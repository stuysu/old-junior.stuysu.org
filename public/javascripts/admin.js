function getInputs(id) {
    return {
        preview: document.getElementById(id + '-link'),
        alias: document.getElementById(id + '-alias'),
        url: document.getElementById(id + '-url'),
        thread: document.getElementById(id + '-thread'),
        update: document.getElementById(id + '-update')
    };
}

function getInputsEvent(id) {
    return {
        preview: document.getElementById(id + '-link-e'),
        title: document.getElementById(id + '-title-e'),
        date: document.getElementById(id + '-date-e'),
        description: document.getElementById(id + '-description-e'),
        url: document.getElementById(id + '-url-e'),
        poster: document.getElementById(id + '-poster-e'),
        thread: document.getElementById(id + '-thread-e'),
        update: document.getElementById(id + '-update-e')
    };
}

async function removeLink(id) {
    const { thread } = getInputs(id);
    
    thread.remove();

    let response = await fetch('/api/links/' + id, {
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

async function removeEvent(id) {
    const { thread } = getInputsEvent(id);
    
    thread.remove();

    let response = await fetch('/api/events/' + id, {
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

            alertManager.addAlert('Failure', 'did not find an event to delete', 'secondary');
        
        } else {

            alertManager.addAlert('Success', `deleted event`, 'warning');

        }

    } else {

        alertManager.addAlert('Failure', `received an error from the server`, "danger");
    
    }

}

async function updateLink(id) {

    const { alias, url } = getInputs(id);
    let response = await fetch("/api/links", {
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

async function updateEvent(id) {

    const { title, date, description, url, poster} = getInputsEvent(id);
    let response = await fetch("/api/events", {
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
            title: title.value,
            date: date.value,
            description: description.value,
            url: url.value,
            poster: poster.value
        })
    });

    response = await response.json(); 

    if (response.error) {

        alertManager.addAlert('Failure', `received an error from the server`, "danger");

    } else {


        if (response.found && (response.updatedTitle || response.updatedDate || response.updatedDescription || response.updatedUrl || response.updatedPoster)) {
            let changedMessage = '';
            let comma = false;
            changedMessage += (response.updatedTitle ? (`"${response.old.title}" to "${response.title}"`) : "");
            comma = response.updatedTitle ? true : false;
            changedMessage += (response.updatedDate ? (`${comma ? ", ":""}"${response.old.date}" to "${response.date}"`) : "");
            comma = response.updatedDate ? true : false;
            changedMessage += (response.updatedDescription ? (`${comma ? ", ":""}"${response.old.description}" to "${response.description}"`) : "");
            comma = response.updatedDescription ? true : false;
            changedMessage += (response.updatedUrl ? (`${comma ? ", ":""}"${response.old.url}" to "${response.url}"`) : "");
            comma = response.updatedUrl ? true : false;
            changedMessage += (response.updatedPoster ? (`${comma ? ", ":""}"${response.old.poster}" to "${response.poster}"`) : "");
            
            alertManager.addAlert('Success', `changed ${changedMessage}`, 'primary');
        } else {
            alertManager.addAlert('', `Entry not found or no changes were made`, 'secondary');
        }

    }

}

async function addLink() {

    const { preview, alias, url } = getInputs('add');

    let response = await fetch("/api/links", {
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

async function addEvent() {

    const { preview, title, date, description, url, poster } = getInputsEvent('add');

    let response = await fetch("/api/events", {
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
            title: title.value,
            date: date.value,
            description: description.value,
            url: url.value,
            poster: poster.value
        })
    });

    response = await response.json();

    if (response.created) {

        addEventToPage(
            response.id,
            response.title,
            response.date,
            response.description,
            response.url,
            response.poster
        );

        title.value = '';
        date.value = '';
        description.value = '';
        url.value = '';
        poster.value = '';
        preview.innerHTML = '';
    
        alertManager.addAlert('Success', `created event "${response.title}"`, "success");

    } else {
        
        alertManager.addAlert('Failure', `failed to create event`, "warning");

    }

}

function updatePreview(id) {
    const { preview, alias, url } = getInputs(id);

    preview.innerHTML = alias.value;
    preview.href = url.value;
}

function updatePreviewEvent(id) {
    const { preview, title, url } = getInputsEvent(id);

    preview.innerHTML = title.value;
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

function addEventToPage(id, title, date, description, url, poster) {

    // get table body
    const mainLinks = document.getElementById('main-events');
	var event = {id, title, date, description, url, poster};
	console.log(event);
	mainLinks.innerHTML +=
	eval('`' +
	('<tr id="<%=event.id%>-thread-e"> \
        <th scope="col"><a id="<%=event.id%>-link-e" href="<%= event.url %>" target="_blank"><%= event.title %></a></th> \
        <td><input type="text" class="form-control" id="<%=event.id%>-title-e" value="<%= event.title %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-date-e" value="<%= event.date %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-description-e" value="<%= event.description %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-url-e" value="<%= event.url %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-poster-e" value="<%= event.poster %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td id="<%=event.id%>-update-e"><button class="btn btn-primary" onclick="updateEvent(\'<%= event.id %>\')">Update</button></td> \
        <td id="<%=event.id%>-remove-e"><button class="btn btn-danger" onclick="removeEvent(\'<%= event.id %>\')">&times;</button></td> \
    </tr>').replaceAll('<%=', '${').replaceAll('%>','}') +
	'`');
}