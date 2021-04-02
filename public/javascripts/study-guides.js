async function getSheets(keyword, addOn='&any=') {
        
    let url = '/api/sheets?';
    if (keyword !== undefined && keyword !== '')
        url += (addOn + keyword);
            
    let result = await fetch(url);
    result = await result.json();

    if (!result.error) {
        console.log('---');
        console.log('From: ' + url);

        console.table(result);
    }

    return result;

}

const searchBar = document.getElementById("search-text");
const queryChooser = document.getElementById("search-type");
const table = document.getElementById("sheets-table");

function getSearchbarText() {
    return searchBar.value;
}

function getQuery() {
    return queryChooser.value;
}

function getSheetHtml(sheet, firstLoad) {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    let nClass = !firstLoad ? "no-fade-in" : "";

    let html = `
        <td class='study-img ${nClass}' >
            <a target="_blank" href='${sheet.url}'>
            <p class='study-txt ${nClass}'> 
                ${sheet.title}
    `;

    for (let option of [ 'subject', 'teacher', 'author' ]) {
        if (sheet[option]) {
            html += `<span class='small'>${capitalize(option)}: ${sheet[option]}</span>`;
        }
    }

    html += `
        </p>
        </a>
    </td>`;


    return html;
}

async function fillSearches(firstLoad = false) {

    let result = await getSheets(
        getSearchbarText(),
        getQuery()
    );

    let html = '';

    if (result.length != 0) {

        let needsClose = false;
        let i = 0;
        for (let i = 0; i < result.length; ++i) {
            if (i % 4 == 0) {
                html += needsClose ? "</tr>" : "<tr>";
                needsClose = !needsClose;
            }
            
            let sheet = result[i];
            
            html += getSheetHtml(sheet, firstLoad);
        }

    } else {

        html = `<tr><td class='${nClass}'><p style='padding-top: 2vw;'>No study guides found 😢</p></td></tr>`;
    
    }

    table.innerHTML = html;

}

fillSearches(true);

document.addEventListener("keyup", async (event) => {
    if (event.keyCode === 13) {
        await fillSearches();
    }
});