// STUDY SHEETS

function getSheetInfo(id) {
    return {
        guide: document.getElementById(id + '-study-guide'),
        title: document.getElementById(id + '-sheet-title'),
        url: document.getElementById(id + '-sheet-url'),
        subject: document.getElementById(id + '-sheet-subject'),
        teacher: document.getElementById(id + '-sheet-teacher'),
        author: document.getElementById(id + '-sheet-author')
    };
}

async function updateSheet(id) {
    const { title, url, subject, teacher, author } = getSheetInfo(id);

    let response = await sfetch("/api/sheets", {
        method: "PUT",
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
            url: url.value,
            subject: subject.value,
            teacher: teacher.value,
            author: author.value
        })
    });

    if (response.error) {
        alertManager.addAlert('Failure', 'received an error from the server', "danger");
    } 

    else {

        if (response.found) {
            alertManager.addAlert('Success', 'updated study guide', 'primary');
        } else {
            alertManager.addAlert('', 'Entry not found', 'secondary');
        }

    }

}

async function removeSheet(id) {
    const { guide } = getSheetInfo(id);

    guide.remove();

    let response = await sfetch('/api/sheets/' + id, {
        method: 'DELETE', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
    });

    if (response.id) {
        
        if (response.deleted === false) {

            alertManager.addAlert('Failure', 'did not find a study sheet to delete', 'secondary');
        
        } else {

            alertManager.addAlert('Success', `deleted study sheet`, 'warning');

        }

    }

    else {
        alertManager.addAlert('Failure', 'received error from server', 'danger');
    }
}

async function addSheet() {
    const { url, title, subject, teacher, author } = getSheetInfo('add');
    let response = await sfetch("/api/sheets", {
        method: "POST",
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            url: url.value,
            title: title.value,
            subject: subject.value,
            teacher: teacher.value,
            author: author.value
        })
    });

    if (response.created) {

        console.log(response);

        // try to sync html
        addSheetToPage(
            response.id,
            response.url,
            response.title,
            response.subject,
            response.teacher,
            response.author
        );

        // reset all input boxes
        let tmp = getSheetInfo('add');
        for (const type in tmp)
            tmp[type].value = '';

        // send alert
        alertManager.addAlert('Success', 'created study sheet!', 'success');
    } else {
        alertManager.addAlert('Failure', 'failed to create study sheet', "warning");
    }
}

function addSheetToPage(id, url, title, subject, teacher, author) {

    const root = document.getElementById("study-sheets");
    const sheet = { id, url, title, subject, teacher, author };

    const code = `
      <div id="${ sheet.id }-study-guide" class="glass sheet">
        <input placeholder="Title..." type="text" class="form-input glass" value="${ sheet.title }"
          id="${ sheet.id }-sheet-title" />
        <input placeholder="Url..." type="text" class="form-input glass" value="${ sheet.url }"
          id="${ sheet.id }-sheet-url" />
        <input placeholder="Subject..." type="text" class="form-input glass" value="${ sheet.subject }"
          id="${ sheet.id }-sheet-subject" />
        <input placeholder="Teacher..." type="text" class="form-input glass" value="${ sheet.teacher }"
          id="${ sheet.id }-sheet-teacher" />
        <input placeholder="Author..." type="text" class="form-input glass" value="${ sheet.author }"
          id="${ sheet.id }-sheet-author" />

        <button id="${ sheet.id }-sheet-update" class="glass button"
          onclick="updateSheet('${ sheet.id }')">Update</button>
        <button id="${ sheet.id }-sheet-remove" class="glass button"
          onclick="removeSheet('${ sheet.id }')">Remove</button>

        <div id="${ sheet.id }-sheet-keywords">
          <div id="add-keyword">
            <input type="text" id="${ sheet.id }-add-keyword-text" placeholder="Keyword..." class="form-input glass" />
            <button id="${ sheet.id }-add-keyword-add" class="glass button" onclick="addKeyword('${ sheet.id }')">Add</button>
          </div>
        </div>
      </div>
    `;

    root.innerHTML += code;

}        

// KEYWORDS

async function removeKeyword(keywordId) {

    document.getElementById(keywordId + '-keyword').remove();

    let response = await sfetch('/api/sheets/keywords/' + keywordId, {
        method: 'DELETE', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
    });

    if (response.id) {
        
        if (response.deleted === false) {
            alertManager.addAlert('Failure', 'did not find a keyword to delete', 'secondary');
        } else {
            alertManager.addAlert('Success', `deleted keyword`, 'warning');
        }

    }

    else {
        alertManager.addAlert('Failure', 'received error from server', 'danger');
    }

}

async function addKeyword(sheetId) {
    const keywordText = document.getElementById(sheetId + '-add-keyword-text').value;

    let response = await sfetch("/api/sheets/keywords", {
        method: "POST",
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            id: sheetId,
            keyword: keywordText
        })
    });

    if (response.error) {
        alertManager.addAlert('Failure', 'received an error from the server', 'danger');
    } else {

        addKeywordToPage(sheetId, response.keyword, response.id);
        
        if (response.created) {
            alertManager.addAlert('Success', `added keyword ${response.keyword}`, 'success');
        } else {
            alertManager.addAlert('Failure', 'didn\'t create study sheet keyword', 'warning');
        }

    }   

}

function addKeywordToPage(sheetId, keyword, id) {
    const root = document.getElementById(`${sheetId}-sheet-keywords`);
    const code = `<div id='${id}-keyword'><div><span id='${id}-keyword-text'>${keyword}</span></div><div><button id='${id}-keyword-remove' class='glass button' onclick="removeKeyword('${id}')">Remove</button></div></div>`;
    root.innerHTML += code;
}