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

function setCalendarTime(id, time) {
    const { date } = getInputsEvent(id);
    let tmp = new Date(time).toISOString();
    tmp = tmp.substring(0, tmp.length - 1);

    date.value = tmp;
}

function getTimestamp(dateElement) {
    return new Date(dateElement.value).getTime();
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
            date: getTimestamp(date),
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
            date: getTimestamp(date),
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

function updatePreviewEvent(id) {
    const { preview, title, url } = getInputsEvent(id);

    preview.innerHTML = title.value;
    preview.href = url.value;
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
        <td><input type="datetime-local" class="form-control" id="<%=event.id%>-date-e" value="<%= event.date %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-description-e" value="<%= event.description %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-url-e" value="<%= event.url %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td><input type="text" class="form-control" id="<%=event.id%>-poster-e" value="<%= event.poster %>" oninput="updatePreviewEvent(\'<%= event.id %>\')" /></td> \
        <td id="<%=event.id%>-update-e"><button class="btn btn-primary" onclick="updateEvent(\'<%= event.id %>\')">Update</button></td> \
        <td id="<%=event.id%>-remove-e"><button class="btn btn-danger" onclick="removeEvent(\'<%= event.id %>\')">&times;</button></td> \
    </tr>').replaceAll('<%=', '${').replaceAll('%>','}') +
	'`');
}