const { Calendar } = require('./../models');

// Constants

const UNKNOWN_DAY = {
    type: '--',
    firstPeriod: 1
};

async function getDayInfo(date = new Date(Date.now())) {
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let day = date.getDate();

    let dayInfo = await Calendar.findOne({ 
        where: {
            day: day, 
            year: year, 
            month: month
        }
    });

    console.log(dayInfo);
    return dayInfo != null ? dayInfo : UNKNOWN_DAY;
}

module.exports = {
    getDayInfo: getDayInfo
}