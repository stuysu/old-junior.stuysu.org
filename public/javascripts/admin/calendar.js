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
    let request = await sfetch(`/api/calendar?day=${date.day}&month=${date.month}&year=${date.year}`);
    
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
    calendarInputs.remoteGroup.selectedIndex = -1;
    calendarInputs.dayLetter.selectedIndex = -1; 
    calendarInputs.notes.value = '';
}

function getDateFromCalendar(a) {
    return new Date(a.year, a.month - 1, a.day);
}

async function updateCalendarForm() {
    
    daySelect.max = getDaysInMonth(monthSelect.selectedIndex + 1, yearSelect.value);
    
    let currentDate = getCurrentDate();
    daySelect.value = currentDate.day;

    let existingDate = await getExistingDate(currentDate);

    let dayIndex = getDateFromCalendar(currentDate).getDay();
    const days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
    calendarInputs.dateline.innerHTML = `${currentDate.month}/${currentDate.day}/${currentDate.year}<br>${days[dayIndex]}`
    
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

function isCalendarInputValid() {

    return !(
        calendarInputs.remoteGroup.selectedIndex < 0 || 
        calendarInputs.dayLetter.selectedIndex < 0
    ) 
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
    // console.log(a);
    return a;
}

async function saveDate() {
    if (!isCalendarInputValid()) {
        alertManager.addAlert("Failure", "not all date inputs are filled out, cannot make a new date entry", "warning");
        return;
    }

    let response = await sfetch("/api/calendar", {
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

    if (response.updated) {
        alertManager.addAlert("Success", "updated existing date with new information");
    } 
    else if (response.id) {
        alertManager.addAlert("Success", "created new date entry with given data");
    }
    else {
        alertManager.addAlert("Failure", "likely database error", "warning");
    }
}

async function clearDate() {
    clearInputs();


    let existingDate = await getExistingDate(getCurrentDate());
    if (existingDate != null) {

        let response = await sfetch("/api/calendar/" + existingDate.id, {
            method: "DELETE",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer"
        });

        if (response.deleted) {
            alertManager.addAlert("Success", "Selected date cleared from the database");
            return;
        }

    }

    alertManager.addAlert("Failure", "No date to clear from database, or database error", "warning");
}

onResponseLoad();