function getDayType() {
    return Number(document.getElementById("day-type").getAttribute('data-day-type'));
}

function isHomeroomDay() { // isLateDay
    return getDayType() == 'homeroom'; // returns boolean
}
function isConferenceDay() {
  return getDayType() == 'conference';
}

/*
PERIOD SCHEDULE CODE
*/

// helper for creating periods
function getPayload(n) {
    if (n === undefined) {
        return {
            name: 'BRK',
            isBreak: true
        }
    }

    let name = `Pd ${n}`;

    return {
        name: name,
        isBreak: false
    }
}

// period tables

function getPeriods() {

  if (isHomeroomDay() == true) {

    const PERIODS = [

      new Period(new Time(08, 00), new Time(08, 40), getPayload(1)),
      new Period(new Time(08, 41), new Time(08, 44), getPayload()),
      new Period(new Time(08, 45), new Time(09, 25), getPayload(2)),
      new Period(new Time(09, 26), new Time(09, 28), getPayload()),
      new Period(new Time(09, 29), new Time(10, 09), getPayload(3)),
      new Period(new Time(10, 10), new Time(10, 29), getPayload()),
      new Period(new Time(10, 30), new Time(11, 10), getPayload(4)),
      new Period(new Time(11, 11), new Time(11, 13), getPayload()),
      new Period(new Time(11, 14), new Time(11, 54), getPayload(5)),
      new Period(new Time(11, 55), new Time(11, 57), getPayload()),
      new Period(new Time(11, 58), new Time(12, 38), getPayload(6)),
      new Period(new Time(12, 39), new Time(12, 41), getPayload()),
      new Period(new Time(12, 42), new Time(13, 22), getPayload(7)),
      new Period(new Time(13, 23), new Time(13, 25), getPayload()),
      new Period(new Time(13, 26), new Time(14, 06), getPayload(8)),
      new Period(new Time(14, 07), new Time(14, 09), getPayload()),
      new Period(new Time(14, 10), new Time(14, 50), getPayload(9)),
      new Period(new Time(14, 51), new Time(14, 54), getPayload()),
      new Period(new Time(14, 55), new Time(15, 35), getPayload(10))
    
    ];
    return PERIODS;

  } else if (isConferenceDay() == true) {
    
    const PERIODS = [

      new Period(new Time(08, 00), new Time(08, 37), getPayload(1)),
      new Period(new Time(08, 38), new Time(08, 40), getPayload()),
      new Period(new Time(08, 41), new Time(09, 18), getPayload(2)),
      new Period(new Time(09, 19), new Time(09, 20), getPayload()),
      new Period(new Time(09, 21), new Time(09, 59), getPayload(3)),
      new Period(new Time(10, 00), new Time(10, 02), getPayload()),
      new Period(new Time(10, 03), new Time(10, 40), getPayload(4)),
      new Period(new Time(11, 41), new Time(11, 43), getPayload()),
      new Period(new Time(11, 44), new Time(11, 21), getPayload(5)),
      new Period(new Time(11, 22), new Time(11, 24), getPayload()),
      new Period(new Time(11, 25), new Time(12, 02), getPayload(6)),
      new Period(new Time(12, 03), new Time(12, 05), getPayload()),
      new Period(new Time(12, 06), new Time(12, 43), getPayload(7)),
      new Period(new Time(12, 44), new Time(12, 46), getPayload()),
      new Period(new Time(12, 47), new Time(13, 24), getPayload(8)),
      new Period(new Time(13, 25), new Time(13, 27), getPayload()),
      new Period(new Time(13, 28), new Time(14, 05), getPayload(9)),
      new Period(new Time(14, 06), new Time(14, 08), getPayload()),
      new Period(new Time(14, 09), new Time(14, 46), getPayload(10))
    
    ];
    return PERIODS;

  } else {
    
    const PERIODS = [

      new Period(new Time(08, 00), new Time(08, 41), getPayload(1)),
      new Period(new Time(08, 42), new Time(08, 44), getPayload()),
      new Period(new Time(08, 45), new Time(09, 26), getPayload(2)),
      new Period(new Time(09, 27), new Time(09, 30), getPayload()),
      new Period(new Time(09, 31), new Time(10, 15), getPayload(3)),
      new Period(new Time(10, 16), new Time(10, 19), getPayload()),
      new Period(new Time(10, 20), new Time(11, 01), getPayload(4)),
      new Period(new Time(11, 02), new Time(11, 05), getPayload()),
      new Period(new Time(11, 06), new Time(11, 47), getPayload(5)),
      new Period(new Time(11, 48), new Time(11, 51), getPayload()),
      new Period(new Time(11, 52), new Time(12, 33), getPayload(6)),
      new Period(new Time(12, 34), new Time(12, 37), getPayload()),
      new Period(new Time(12, 38), new Time(13, 19), getPayload(7)),
      new Period(new Time(13, 20), new Time(13, 23), getPayload()),
      new Period(new Time(13, 24), new Time(14, 05), getPayload(8)),
      new Period(new Time(14, 06), new Time(14, 08), getPayload()),
      new Period(new Time(14, 09), new Time(14, 50), getPayload(9)),
      new Period(new Time(14, 51), new Time(14, 53), getPayload()),
      new Period(new Time(14, 54), new Time(15, 35), getPayload(10))
    
    ];
    return PERIODS;
  }
}
const first = getPeriods()[0].first;
const last = getPeriods()[getPeriods().length - 1].second;

function timeRange() {
    return first.minutesBetween(last);
}

function getElapsedTime(time, periods) {
    if (periods.length < 1)
        return false;

    let period = periods[0];

    return {
        elapsed: time.minutesBetween(period.first),
        left: time.minutesBetween(period.second)
    };
}

/*
HTML CODE
*/

const row = document.getElementById("bell-schedule-row");
const ticker = document.getElementById("ticker");

const timePast = document.getElementById("time-past-number");
const timeLeft = document.getElementById("time-left-number");

const dayPeriod = document.getElementById("time-day-period");
const dayTime = document.getElementById("time-day-time");

function setTicker(time) {
    ticker.style.visibility = 'visible';
    
    // Set the position of the ticker
    let timePassed = time.minutesBetween(first);
    let percentOfDay = 100 * (timePassed / timeRange());
    let tickerWidth = getComputedStyle(ticker).width;
    ticker.style.left = `calc(${percentOfDay}% - ${tickerWidth} / 2)`;
}

function setTime(time) {
    // display the time that was passed into the function
    dayTime.innerHTML = time.toString();

    // Find the period according to the time,
    // and display its name
    let periods = findPeriod(time, getPeriods());
    let periodText = '';
    if (periods.length > 0) {
        periodText = `&#8226; ${periods[0].payload.name}`;
    }
    dayPeriod.innerHTML = periodText;


    // If there are any periods, move the ticker
    // if not, hide the ticker
    if (periods.length > 0) {
        setTicker(time);
    } else {
        ticker.style.visibility = 'hidden';
    }

    // Using the period(s) it is now, find past time
    // and time left
    let times = getElapsedTime(time, periods);
    if (!times) {
        times = { elapsed: '', left: '' };
    } else {
        times.elapsed += ' Minutes Past';
        times.left += ' Minutes Left';
    }
    timePast.innerHTML = times.elapsed;
    timeLeft.innerHTML = times.left;

    
}

function displayPeriods() {
    // for every period, add its html
    for (let period of getPeriods()) {

        if (!period.payload.isBreak) {

            row.innerHTML += `
                    <td class='table-period'>
                        ${period.payload.name}
                            <br>
                        <span class="timeline">
                            (${period.first} - ${period.second})
                        </span>
                    </td>
                `;

        } else {

            row.innerHTML += `
                    <td class='table-period break'>
                    </td>
                `;
        }

    }
}

// must be called once
displayPeriods();

class NowTimer {
    getTime() {
        return Time.now();
    }
}

class LoopTimer {

    constructor() {
        this.time = first;
    }

    getTime() {
        this.time = this.time.add(new Time(0, 1));

        if (this.time.compare(last) == 0) {
            this.time = first;
        }

        return this.time;
    }

}

let timer = new NowTimer();
let lastTime = undefined;
let timeInterval = 1000;

function updateTime() {
    let currentTime = timer.getTime();
    if (
        lastTime === undefined || 
        currentTime.compare(lastTime) !== 0
    ) {
        setTime(currentTime);
    }

    lastTime = currentTime;
}

updateTime();
setInterval(
    updateTime, 
    timeInterval
);

document.addEventListener('keypress', e => {
    if (e.keyCode === 112 || e.keyCode === 80) {
        running = !running;
    }
});