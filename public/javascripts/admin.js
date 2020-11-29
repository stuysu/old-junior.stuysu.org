function getInputs(id) {
    return {
        preview: document.getElementById(id + '-link'),
        alias: document.getElementById(id + '-alias'),
        url: document.getElementById(id + '-url'),
        update: document.getElementById(id + '-update')
    };
}

function updateLink(id) {

    // const url = 'http://localhost:3001/links';
    // const data = {
        
    // };

    console.log(`${id} =-> ${typeof id}`);
}

function updatePreview(id) {
    const { preview, alias, url } = getInputs(id);
    
    preview.innerHTML = alias.value;
    preview.href = url.value;

    console.log(`${id} =-> ${typeof id}`);
}