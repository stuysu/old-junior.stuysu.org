function getPageLocation() {
    return window.location.href;
}

function toMobile(str) {
    console.table(document.location);
    let mobile = document.location.origin + '/mobile' + document.location.pathname;
    return mobile;
} 

function fromMobile(str) {
    return document.location.origin + document.location.pathname.replace('/mobile', '/');
}

function isMobile() {
    // const mobileWidth = 1024;
    // return window.matchMedia(`only screen and (max-width: ${1024}px)`).matches;

    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);
}