const { Calendar } = require('./../models');

// Constants

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
    let dayInfo = await Calendar.findOne({ 
        where: getWhereFromDate(date)
    });

    if (dayInfo !== null) {
        dayInfo.today = true;
    } else {

        let daysInFuture = 7;

        while (dayInfo === null && daysInFuture --> 0) {
            date.setDate(date.getDate() + 1);
            dayInfo = await Calendar.findOne({where: getWhereFromDate(date)});
        }

        if (dayInfo !== null) {
            dayInfo.today = false;
        }
    }

    console.log(dayInfo);
    return dayInfo;
}

module.exports = {
    getDayInfo: getDayInfo
}