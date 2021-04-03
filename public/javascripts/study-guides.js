async function getSheets(keyword, addOn='&any=') {
        
    let url = '/api/sheets?';
    if (keyword !== undefined && keyword !== '')
        url += (addOn + keyword);
            
    let result = await fetch(url);
    result = await result.json();

    // if (!result.error) {
    //     console.log('---');
    //     console.log('From: ' + url);

    //     console.table(result);
    // }

    return result;

}

const searchBar = document.getElementById("search-text");
const queryChooser = document.getElementById("search-type");

function getSearchbarText() {
    return searchBar.value;
}

function getQuery() {
    return queryChooser.value;
}

async function fillSearches(firstLoad = false) {

    let result = await getSheets(
        getSearchbarText(),
        getQuery()
    );

    let nClass = !firstLoad ? "no-fade-in" : "";
    let html = result.length != 0 ? getSheetsHtml(result, nClass) : getDefaultHtml(nClass);

    consumeHtml(html);
}

document.addEventListener("keyup", async (event) => {
    if (event.keyCode === 13) {
        await fillSearches();
    }
});

fillSearches(true);