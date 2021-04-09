/*
PERIOD SCHEDULE CODE
*/

// helper for creating periods
function getPayload(n, brk = false) {
    return {
        name: n,
        isBreak: brk
    }
}

// period table
const PERIODS = [

    new Period(new Time(09, 10), new Time(10, 05), getPayload('Pd 1')),
    new Period(new Time(10, 06 - 1), new Time(10, 14 + 1), getPayload(null, true)),
    new Period(new Time(10, 15), new Time(11, 10), getPayload('Pd 2')),
    new Period(new Time(11, 11 - 1), new Time(11, 19 + 1), getPayload(null, true)),
    new Period(new Time(11, 20), new Time(12, 15), getPayload('Pd 3')),
    new Period(new Time(12, 16 - 1), new Time(12, 24 + 1), getPayload(null, true)),
    new Period(new Time(12, 25), new Time(13, 20), getPayload('Pd 4')),
    new Period(new Time(13, 21 - 1), new Time(13, 29 + 1), getPayload(null, true)),
    new Period(new Time(13, 30), new Time(14, 25), getPayload('Pd 5')),

];

const first = PERIODS[0].first;
const last = PERIODS[PERIODS.length - 1].second;

function timeRange() {
    return first.minutesBetween(last);
}

function getPeriods(time) {
    return findPeriod(time, PERIODS);
}

function isPeriod(test, periods) {
    for (let period of periods) {
        if (test.compare(period) == 0)
            return true;
    }
    return false;
}

/*
HTML CODE
*/

const row = document.getElementById("bell-schedule-row");
const ticker = document.getElementById("ticker");

function setTicker(time) {
    // Set the position of the ticker
    let timePassed = time.minutesBetween(first);
    let percentOfDay = 100 * (timePassed / timeRange());
    let tickerWidth = getComputedStyle(ticker).width;
    ticker.style.left = `calc(${percentOfDay}% - ${tickerWidth} / 2)`;
}

function setTime(time) {
    setTicker(time);
}

function displayPeriods() {
    for (let period of PERIODS) {

        if (!period.payload.isBreak) {

            row.innerHTML += `
                    <td>
                        ${period.payload.name}
                            <br>
                        <span class="timeline">
                            (${period.first} - ${period.second})
                        </span>
                    </td>
                `;

        } else {
            row.innerHTML += `
                    <td class='break'>
                    </td>
                `;
        }

    }
}

function getElapsedTime(time, periods = null) {
    if (periods == null)
        periods = getPeriods(time);

    if (periods.length == 0)
        return false;

    let period = periods[0];

    return {
        elapsed: time.minutesBetween(period.first),
        left: time.minutesBetween(period.second)
    };
}

// MAIN CODE

// must be called once
displayPeriods();

function getUpdateRate() {
    // every minute (1000 ms * 60 seconds)
    return 1000 * 60;
}

function update(time = Time.now()) {
    setTime(time);
}

let running = true;
let time = first;

setInterval(() => {
    if (running) {
        update(time);
        time = time.add(new Time(0, 01));
        if (time.compare(last) == 0) {
            time = first;
        }
    }
}, 100);

document.addEventListener('keypress', e => {
    if (e.keyCode === 112 || e.keyCode === 80) {
        running = !running;
    }
});