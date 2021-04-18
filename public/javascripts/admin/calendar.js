let monthSelect = null;
let yearSelect = null;
let daySelect = null;

let calendarForm = null;

let calendarInputs = null;

function getCalendarInputs() {
    return {
        dateline: document.getElementById(`calendar-dateline`),
        dayLetter: document.getElementById(`calendar-day-letter`),
        isLate: document.getElementById(`calendar-is-late`),
        remoteGroup: document.getElementById(`calendar-remote-group`),
        notes: document.getElementById("calendar-notes")
    }
}

function onResponseLoad() {
    let date = new Date(Date.now());

    monthSelect = document.getElementById("month-select");
    yearSelect = document.getElementById("year-select");
    daySelect = document.getElementById("day-select");

    calendarForm = document.getElementById("calendar-form");
    calendarInputs = getCalendarInputs();

    yearSelect.value = date.getFullYear();
    monthSelect.selectedIndex = date.getMonth();
    daySelect.value = date.getDate();

    updateCalendarForm();
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function clamp(value,min,max) {
    return Math.max(min, Math.min(value, max));
}

function getCurrentDate() {
    return {
        day: clamp(daySelect.value, Number(daySelect.min), Number(daySelect.max)),
        month: monthSelect.selectedIndex + 1,
        year: Number(yearSelect.value)
    }
}

async function getExistingDate(date) {
    let request = await fetch(`/api/calendar?day=${date.day}&month=${date.month}&year=${date.year}`);
    request = await request.json();
    
    return request;
}

function getSelectIndex(select, value) {
    for (let i = 0; i < select.options.length; ++i) {
        if (value == select.options[i].value) {
            return i;
        }
    }

    return 0;
}

function clearInputs() {
    calendarInputs.isLate.checked = false;
    calendarInputs.remoteGroup.selectedIndex =0;
    calendarInputs.dayLetter.selectedIndex = 0; 
    calendarInputs.notes.value = '';
}

async function updateCalendarForm() {
    
    daySelect.max = getDaysInMonth(monthSelect.selectedIndex + 1, yearSelect.value);
    
    let currentDate = getCurrentDate();
    daySelect.value = currentDate.day;

    let existingDate = await getExistingDate(currentDate);

    calendarInputs.dateline.innerText = `${currentDate.month}/${currentDate.day}/${currentDate.year}`
    
    if (existingDate != null) {
        console.log("updating ");
        calendarInputs.dayLetter.selectedIndex = getSelectIndex(calendarInputs.dayLetter, existingDate.dayLetter);
        calendarInputs.isLate.checked = existingDate.firstPeriod == 6;
        calendarInputs.remoteGroup.selectedIndex = getSelectIndex(calendarInputs.remoteGroup, existingDate.remoteGroup);
        calendarInputs.notes.value = existingDate.note;
    } else {
        console.log("clearing");
        clearInputs();
    }
}

function getCalendarBodyData() {
    let date = getCurrentDate();
    let a = {
        day: date.day,
        month: date.month,
        year: date.year,
        dayLetter: calendarInputs.dayLetter.value,
        firstPeriod: calendarInputs.isLate.checked ? 6 : 1,
        remoteGroup: calendarInputs.remoteGroup.value,
        note: document.getElementById('calendar-notes').value
    };
    console.log(a);
    return a;
}

async function saveDate() {
    let response = await fetch("/api/calendar", {
        method: "PUT",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(getCalendarBodyData())
    });
    response = await response.json();
    console.log(response);
}

addResponse(onResponseLoad);