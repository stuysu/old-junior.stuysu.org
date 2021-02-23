// helper
function isValidHttpUrl(string) {
    // let url;
    
    // try {
    //   url = new URL(string);
    // } catch (_) {
    //   return false;  
    // }
  
    // return url.protocol === "http:" || url.protocol === "https:";
    return true;
}

function getInputs(id) {
    return {
        alias: document.getElementById(id + "-alias"),
        url: document.getElementById(id + "-url"),
        thread: document.getElementById(id + "-thread"),
        update: document.getElementById(id + "-update"),
    };
}

async function removeLink(id) {
    const { thread } = getInputs(id);

    thread.remove();
    reorderHtml();

    let response = await fetch("/api/links/" + id, {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
    });

    response = await response.json();

    // if response.id is undefined, response failed
    if (response.id) {
        if (response.deleted === false) {
            alertManager.addAlert(
                "Failure",
                "did not find a link to delete",
                "secondary"
            );
        } else {
            alertManager.addAlert("Success", `deleted link`, "warning");
        }
    } else {
        alertManager.addAlert(
            "Failure",
            `received an error from the server`,
            "danger"
        );
    }
}

async function updateLink(id) {
    const { alias, url } = getInputs(id);

    if (!isValidHttpUrl(url)) {
        alertManager.addAlert('Failure', 'url is not valid', 'danger');
        return;
    }

    let response = await fetch("/api/links", {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            id: id,
            alias: alias.value,
            url: url.value,
        }),
    });

    response = await response.json();

    if (response.error) {
        alertManager.addAlert(
            "Failure",
            `received an error from the server`,
            "danger"
        );
    } else {
        if (response.found && (response.updatedUrl || response.updatedAlias)) {
            let changedMessage = "";
            changedMessage += response.updatedUrl
                ? `"${response.old.url}" to "${response.url}"`
                : "";
            changedMessage += response.updatedAlias
                ? `${response.updatedUrl ? ", " : ""}"${
                      response.old.alias
                  }" to "${response.alias}"`
                : "";

            alertManager.addAlert(
                "Success",
                `changed ${changedMessage}`,
                "primary"
            );
        } else {
            alertManager.addAlert(
                "",
                `Entry not found or no changes were made`,
                "secondary"
            );
        }
    }
}

async function addLink() {
    const { alias, url } = getInputs("add");

    if (!isValidHttpUrl(url)) {
        alertManager.addAlert('Failure', 'url is not valid', 'danger');
        return;
    }


    let response = await fetch("/api/links", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            alias: alias.value,
            url: url.value,
        }),
    });

    response = await response.json();

    if (response.created) {
        addLinkToPage(response.id, response.alias, response.url);

        alias.value = "";
        url.value = "";

        alertManager.addAlert(
            "Success",
            `created "${response.alias}" with redirect to "${response.url}`,
            "success"
        );
    } else {
        alertManager.addAlert("Failure", `failed to create link`, "warning");
    }
}

async function updateOrdering() {
    const links = document.querySelectorAll('tr[id$=-thread]');
    let order = 0;

    for (let link of links) {
        let id = (Number(link.getAttribute('data-link-id')));

        let response = await fetch('/api/links/ordering', {
            method: "PUT",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
                id: id,
                ordering: order,
            }),
        });
        
        response = await response.json();

        order++;
    }

    alertManager.addAlert("Success", "saved the ordering of the links",  "success");

}

function reorderHtml() {
    const links = getLinks();

    let o = 0;
    for (let link of links) {
        link.setAttribute('data-order', o);
        ++o;
    }
}

function getLinks() {
    return document.querySelectorAll('tr[id$=-thread]')
}

// from https://stackoverflow.com/questions/10716986/swap-two-html-elements-and-preserve-event-listeners-on-them
function swapElements(obj1, obj2) {
    // create marker element and insert it where obj1 is
    var temp = document.createElement("div");
    obj1.parentNode.insertBefore(temp, obj1);

    // move obj1 to right before obj2
    obj2.parentNode.insertBefore(obj1, obj2);

    // move obj2 to right before where obj1 used to be
    temp.parentNode.insertBefore(obj2, temp);

    // remove temporary marker node
    temp.parentNode.removeChild(temp);
}


function moveLink(direction, id) {

    const thread = document.getElementById(`${id}-thread`);
    const threadOrder = Number(thread.getAttribute('data-order'));

    const links = getLinks();
    
    let otherThread = null;
    
    let otherOrder = 0;
    for (let link of links) {
        if (otherOrder === (direction + threadOrder)) {
            otherThread = link;
            break;
        }        
        ++otherOrder;    
    }

    // if (otherThread != null) {
    //     console.log(`${threadOrder} being swapped with ${otherOrder}`);
    // } else {
    //     console.log('not thread found');
    // }

    if (otherThread != null) {
        swapElements(thread, otherThread);

        thread.setAttribute('data-order', otherOrder);
        otherThread.setAttribute('data-order', threadOrder);

        alertManager.addAlert("Swapped", `the #${threadOrder + 1} and #${otherOrder + 1} links`, 'success');
    }
}

function addLinkToPage(id, alias, url) {
    // get table body
    const mainLinks = document.getElementById("main-links");
    var link = { id, alias, url };
    var order = getLinks().length;

    mainLinks.innerHTML += 
        `<tr id="${link.id}-thread" data-link-id="${ link.id }" data-order="${ order }"> 
        <td><input type="text" class="form-control" id="${link.id}-alias" value="${ link.alias }" /></td> 
        <td><input type="text" class="form-control" id="${link.id}-url" value="${ link.url }" /></td>  
        <td id="${link.id}-update"><button class="btn btn-primary" onclick="updateLink(\'${ link.id }\')">Update</button></td> 
		<td id="${link.id}-remove"><button class="btn btn-danger" onclick="removeLink(\'${ link.id }\')">&times;</button></td>\
        <td id="${link.id}-reorder">
            <button class="btn btn-info" onclick="moveLink(-1, '${ link.id }')">&uarr;</button>  
            <button class="btn btn-warning" onclick="moveLink(+1, '${ link.id }')">&darr;</button> 
        </td> 
        </tr>`;
}
