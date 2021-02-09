function updateTabs(name) {

    const tabs = document.getElementsByClassName('controlled');
    const target = document.getElementById('controlled-by-' + name);

    const contained = target.classList.contains('off');

    for (let tab of tabs)
        tab.classList.add('off');
 
    if (contained)
        target.classList.remove('off');
}