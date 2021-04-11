const fs = require('fs');

// Constants

const SCHEDULE_CSV = 
    process.env.SCHEDULE_CSV || 
    './routes/schedule.csv';

const UNKNOWN_DAY = {
    type: '--',
    firstPeriod: 1,
    lastPeriod: 5
};

// DATEMAP

let DATEMAP = null;

function generateDatemap(csv) {
    try { 
        let out = new Map();
        let data = fs.readFileSync(csv, 'utf8');

        data = data.split('\n');

        for (let i = 1; i < data.length; ++i) {
            let parts = data[i].split(',');

            out.set(parts[0], { 
                type: parts[1],
                firstPeriod: Number(parts[2]),
                lastPeriod: Number(parts[3])
            });
        }

        return out;

    } catch (e) {
        console.error(e);
        return new Map();
    }
}

function getDatemap() {
    if (DATEMAP == null) {
        DATEMAP = generateDatemap(SCHEDULE_CSV);
    }
    return DATEMAP;
}

function getDayInfo(date = new Date(Date.now())) {
    let year = date.getFullYear() % 100;
    let dayKey = `${date.getMonth() + 1}/${date.getDate()}/${year}`;

    let dayInfo = getDatemap().get(dayKey);
    if (dayInfo !== undefined) {
        return dayInfo;
    }
    return UNKNOWN_DAY;
}

module.exports = {
    getDatemap: getDatemap,
    getDayInfo: getDayInfo
}