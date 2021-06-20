const { Calendar } = require('./../models');

// Constants

const MAX_TIME = { hours: 16, minutes: 30 };

function getWhereFromDate(date) {
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let day = date.getDate();

    return {
        day: day,
        year: year,
        month: month
    };
}

async function getDayInfo(date = new Date(Date.now())) {
    date.setHours(date.getHours() - 4);
    let dayInfo = await Calendar.findOne({ 
        where: getWhereFromDate(date)
    });

    if (dayInfo !== null) {
        dayInfo.today = true;

        if (date.getHours() > MAX_TIME.hours || date.getHours() == MAX_TIME.hours && date.getMinutes() >= MAX_TIME.minutes) {
            dayInfo = null;
        }
    } 
    if (dayInfo === null) {

        let daysInFuture = 7;

        while (dayInfo === null && daysInFuture --> 0) {
            date.setDate(date.getDate() + 1);
            dayInfo = await Calendar.findOne({where: getWhereFromDate(date)});
        }

        if (dayInfo !== null) {
            dayInfo.today = false;
        }
    }

    // console.log(dayInfo);
    return dayInfo;
}

module.exports = {
    getDayInfo: getDayInfo
}