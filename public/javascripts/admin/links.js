// RESPONSE CALLBACK

function init() {
    setupDraggable();
    prepLinks();
}
init();

// ADMIN PANEL FUNCTIONALITY

function prepLinks() {
    for (let link of getLinks()) {
        link.onclick = () => setupTable(link.getAttribute('data-link-id'));
    }
}

function getLinkInputs(id) {
    return {
        alias: document.getElementById(`link-alias-${id}`),
        url: document.getElementById(`link-url-${id}`)
    }
}

function getLinks() {
    return document.querySelectorAll('.link');
}

function getTable() {
    return document.getElementById('links-table');
}

function setupTable(id) { 
    const MOD = 'data-modifying';
    
    const table = getTable();
    let modifying = (table.getAttribute(MOD));

    const link = document.getElementById(`link-${id}`);
    const { alias, url } = getLinkInputs('input');

    if (modifying !== id) {
        // fill table

        for (let link of getLinks()) {
            link.classList.remove('modifying');
        }

        link.classList.add('modifying');
        
        table.setAttribute(MOD, id);

        alias.value = link.getAttribute('data-alias');
        url.value = link.getAttribute('data-url');

        alias.disabled = false;
        url.disabled = false;

    } else {
        // clear table
        link.classList.remove('modifying');
        table.setAttribute(MOD, -1);

        alias.value = '';
        url.value = '';

        alias.disabled = true;
        url.disabled = true;
    }

}

async function reorder() {
    const links = getLinks();
    let order = 0;

    for (let link of links) {
        let id = (Number(link.getAttribute('data-link-id')));

        let response = await sfetch('/api/links/ordering', {
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
    
        order++;
    }

    alertManager.addAlert("Success", "saved the ordering of the links",  "success");
}

async function addLink() {
    const { alias, url } = getLinkInputs("add");

    let response = await sfetch("/api/links", {
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

    if (response.created) {
        addLinkToPage(response.id, response.alias, response.url);

        clearLink();

        alertManager.addAlert(
            "Success",
            `created "${response.alias}" with redirect to "${response.url}`,
            "success"
        );
    } else {
        alertManager.addAlert("Failure", `failed to create link`, "warning");
    }
}

async function addLinkToPage(id, alias, url) {
    const linkManager = document.getElementById("link-manager");

    let html = `
        <li 
            data-link-id="${ id }" 
            id="link-${ id }" 
            draggable="true" 
            class="link draggable"

            data-alias="${ alias }"
            data-url="${ url }"
        >

            ${ alias } (<span>${ url }</span>)

        </li>
    `;

    linkManager.innerHTML = html + linkManager.innerHTML;

    prepLinks();
    reorder();
}

function clearLink() {
    const { alias, url } = getLinkInputs('add');
    alias.value = '';
    url.value = '';
}

async function updateLink() {
    const table = getTable();
    let modifying = table.getAttribute('data-modifying');
    // i literally dont have slightest clue what modifying's default value is
    if (modifying !== -1 || modifying !== undefined || modifying !== null) {
        saveLink(modifying);
    }
}

async function removeLink() {
    const table = getTable();
    let modifying = table.getAttribute('data-modifying');
    // i literally dont have slightest clue what modifying's default value is
    if (modifying !== -1 || modifying !== undefined || modifying !== null) {
        deleteLink(modifying);
    }
}

async function deleteLink(id) {
    const link = getLinkById(id);

    link.remove();

    const { alias , url } = getLinkInputs('input');
    alias.value = '';
    url.value = '';

    let response = await sfetch("/api/links/" + id, {
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

async function saveLink(id) {
    const { alias, url } = getLinkInputs("input");

    let response = await sfetch("/api/links", {
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

            updateLinkOnPage(id, alias.value, url.value);

        } else {
            alertManager.addAlert(
                "",
                `Entry not found or no changes were made`,
                "secondary"
            );
        }
    }
}

function getLinkById(id) {
    return document.getElementById(`link-${id}`);
}

function updateLinkOnPage(id, alias, url) {
    // update the link (thiks is so shitty and there should be more hepler functions for this)
            
    const link = getLinkById(id);
    link.setAttribute('data-alias', alias);
    link.setAttribute('data-url', url);
    link.innerHTML = `${ alias } (<span>${ url }</span>)`;
}

// DRAG AND DROP TARGET ELEMENTS

function getDraggable() {
    return document.querySelectorAll('.draggable');
}

// DRAG AND DROP CALLBACKS

let dragged = null;

function onDragStart(e) {
    this.classList.add('dragging');

    getDraggable().forEach(d => d.classList.remove('dropped'));

    dragged = this;

    // e.dataTransfer.effectAllowed = 'move';
    // e.dataTransfer.setData('text/html', this.innerHTML);
}

function onDragEnd(e) {
    this.classList.remove('dragging');

    getDraggable().forEach(draggable => {
        draggable.classList.remove('over');
    });
}

function onDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
  
    this.classList.add('over');

    return false;
}

function onDragEnter(e) {
    this.classList.add('over');
}

function onDragLeave(e) {
    this.classList.remove('over');
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

async function onDrop(e) {
    e.stopPropagation(); // stops the browser from redirecting.

    if (dragged !== this) {
        swapElements(dragged, this);

        dragged.classList.remove('dropped');
        this.classList.remove('dropped');

        dragged.classList.add('dropped');
        this.classList.add('dropped');

        // 
        reorder();
    }

    return false;
}

// USE DRAG AND DROP

function setupDraggable() {
    getDraggable().forEach(draggable => {
        draggable.addEventListener("dragstart", onDragStart);
        draggable.addEventListener("dragend", onDragEnd);
        draggable.addEventListener('dragover', onDragOver);
        draggable.addEventListener('dragenter', onDragEnter);
        draggable.addEventListener('dragleave', onDragLeave);
        draggable.addEventListener('dragend', onDragEnd);
        draggable.addEventListener('drop', onDrop);
    });
}
