function getInputs(id) {
    return {
        preview: document.getElementById(id + '-link'),
        alias: document.getElementById(id + '-alias'),
        url: document.getElementById(id + '-url'),
        thread: document.getElementById(id + '-thread'),
		update: document.getElementById(id + '-update')
    };
}

function updateLink(id) {

    const url = 'http://localhost:3001/links';
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
async function addLink() {
	const { preview, alias, url, update, thread } = getInputs('add');
	const response = await fetch("/links", { 
		method: "POST",
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type':'application/json'
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify({
			alias: alias.value,
			url: url.value
		})
	});
	
}
async function removeLink(id) {
	const { preview, alias, url, update, thread } = getInputs(id);
	thread.remove();
	return await fetch('/links/'+id,
		{
			method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers: {
				'Content-Type': 'application/json'
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow', // manual, *follow, error
			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		}); // body data type must match "Content-Type" header
}