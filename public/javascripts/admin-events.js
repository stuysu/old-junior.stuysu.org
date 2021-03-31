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

function removeSpaces(str) {
    return str.replace(/\s+/g, '');
}

function validateLink(link) {
    // return (removeSpaces(link) === '') ? null : link;

    let cleaned = removeSpaces(link);
    let output = (cleaned === '') ? undefined : link;

    console.log(output);
    return output;

}

function setCalendarTime(id, time) {
    const { date } = getInputsEvent(id);
    let tmp = new Date(time).toISOString();
    tmp = tmp.substring(0, tmp.length - 1);

    date.value = tmp;
}

// gets a timestamp (storable in database) from a js date
function getTimestamp(dateElement) {
    return new Date(dateElement.value).getTime();
}

// also in admin/responses/events.ejs
// gets a formatted string from a timestamp 
function getDate(dateFromSql) {
    tmp = new Date(dateFromSql);
    tmp.setHours(tmp.getHours() - 4);
    tmp = tmp.toISOString();
    return tmp.substring(0, tmp.length - 1);
}

function getBody(id, title, dateElement, description, url, poster) {
    return JSON.stringify({
        id: id,
        title: validateLink(title),
        date: getTimestamp(dateElement),
        description: description,
        url: validateLink(url),
        poster: validateLink(poster)
    });
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
        body: getBody(
            id, 
            title.value, 
            date, 
            description.value, 
            url.value, 
            poster.value
        )
    });

    response = await response.json(); 

    if (response.error) {

        alertManager.addAlert('Failure', `received an error from the server`, "danger");

    } else {


        if (response.found && 
            (response.updatedTitle || response.updatedDate || response.updatedDescription || response.updatedUrl || response.updatedPoster)
        ) {
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
        body: getBody(
            undefined, 
            title.value, 
            date, 
            description.value, 
            url.value, 
            poster.value
        )
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
    
        alertManager.addAlert('Success', `created event "${response.title}"`, "success");

    } else {
        
        alertManager.addAlert('Failure', `failed to create event`, "warning");

    }

}

function addEventToPage(id, title, date, description, url, poster) {

    // validate date
    date = getDate(date);

    // get table body
    const mainLinks = document.getElementById('main-events');
	var event = {id, title, date, description, url, poster};
    
    let out = `
    <tr id="${event.id}-thread-e"> 
    <td>
        <input type="text" placeholder="Title..." class="form-control" id="${event.id}-title-e" value="${ event.title }" oninput="updatePreviewEvent('${ event.id }')" />
        <input type="datetime-local" class="form-control" id="${event.id}-date-e" value="${ event.date }" />
    </td>

    <td>
        <input type="text" class="form-control" placeholder="Speical redirect..." id="${event.id}-url-e" value="${ event.url }" />
        <input type="text" class="form-control" placeholder="Poster image..." id="${event.id}-poster-e" value="${ event.poster }" />
    </td>

    <td>
        <textarea type="text" class="form-control" id="${event.id}-description-e"">${ event.description }
        </textarea>
    </td>

    <td>
        <button class="btn btn-primary" onclick="updateEvent('${ event.id }')">Update</button>
        <button class="btn btn-danger" onclick="removeEvent('${ event.id }')">&times;</button>
    </td>
    </tr>
    `;

    console.log(out);

	mainLinks.innerHTML += out;
}