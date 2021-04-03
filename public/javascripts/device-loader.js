function getPageLocation() {
    return window.location.href;
}

function toMobile(str) {
    console.table(document.location);
    let mobile = document.location.origin + '/mobile' + document.location.pathname;
    return mobile;
} 

function fromMobile(str) {
    return document.location.origin + document.location.pathname.replace('/mobile', '');
}

function isMobile() {

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);

}