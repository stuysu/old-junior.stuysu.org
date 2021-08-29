async function sfetch(url, options) {
    let response = await fetch(url, options);
    
    if (response.status === 401) {
        window.location.replace("/admin/signin?message=Unauthorized%20access%2C%20please%20sign%20in");
    }
    // sfetch automatically json-ifies request because of old cold
    // design and can be changed
    
    // return response;
    return await response.json(); 
}
