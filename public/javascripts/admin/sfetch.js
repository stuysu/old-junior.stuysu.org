async function sfetch(a,n){let e=await fetch(a,n);return 401===e.status&&window.location.replace("/admin/signin?message=Unauthorized%20access%2C%20please%20sign%20in"),await e.json()}
