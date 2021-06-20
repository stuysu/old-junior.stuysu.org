///
/// This is for events docs
/// 

function getDateFromSql(timestamp) {
    let date = new Date(timestamp);
    // IMPORTANT: this hack was necessary to get
    // the times to appear correctly on the main page
    date.setHours(date.getHours() - 4);
    return date;
}

function leadingZero(s) {
    if (s < 10)
        return `0${s}`;
    return `${s}`;
}

function getShortenedDescription(str, length) {
    if (str.length == 0) {
        return 'empty description';
    }

    return str.substring(0, length) + ((str.length > length) ? '...' : '');
}

function getDateLine(eventDate) {
    let month = eventDate.getMonth() + 1;
    let date = eventDate.getDate();
    let year = eventDate.getFullYear();
    
    return `${month}/${date}/${year}`;
}

function getTimeLine(eventDate) {
    let hours = eventDate.getHours();

    let ofDay = hours >= 12 ? 'PM' : 'AM';

    // validate hours (this is so stupid)
    if (hours > 12) {
        hours -= 12;
    } else if (hours == 0) {
        hours = 12;
    }

    let minutes = leadingZero(eventDate.getMinutes());
    

    return `${hours}:${minutes} ${ofDay}`;
}

function generateDatemap(events) {
    let datemap = new Map();
    
    for (let event of events) {
        let date = getDateFromSql(event.date);
        let dateline = getDateLine(date);

        let dates = datemap.get(dateline);
        if (dates === undefined) {
            datemap.set(dateline, [ event ]);
        } else {
            dates.push(event);
        }
    }

    return datemap;
}


module.exports = {
    generateDatemap: generateDatemap,
    getTimeLine: getTimeLine,
    getDateLine: getDateLine,
    getShortenedDescription: getShortenedDescription,
    leadingZero: leadingZero,
    getDateFromSql, getDateFromSql
};