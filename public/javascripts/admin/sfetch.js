async function sfetch(url, options) {
    let response = await fetch(url, options);
    console.log('hello');
    
    try {
        let tmp = await response.json();
        if (tmp.unauthorized) {
            console.log('unauthorized');
            if (tmp.expired) {
                console.log('expired');
                window.location.replace("/admin/signin?message=Session%20expired%2C%20please%20try%20again");
            }
            window.location.replace("/admin/signin?message=Unauthorized%20access%2C%20please%20sign%20in");
        } 
        else return tmp;
    } catch (err) {
        console.error(err);
    }
}
