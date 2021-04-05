function validateRange(val, min, max, what='a value', error = true) {
    if (error && val < min || val > max) {
        throw new Error(`${what} (${val}) is outside valid range [${min}, ${max}]`);
    }

    return val > max ? max : (val < min) ? min : val;
}

function leadingZero(s) {
    if (s < 10) 
        return `0${s}`
    return `${s}`
}

class Time {

    static now() {
        return Time.fromDate(new Date(Date.now()));
    }

    static fromDate(date) {
        return new Time(date.getHours(), date.getMinutes());
    }

    constructor(hours, minutes) {

        // store as 24-hour time (infinitely easier)
        this.hours = validateRange(
            hours, 
            0, 23, 
            'hours'
        );
        
        this.minutes = validateRange(
            minutes, 
            0, 59, 
            'minutes'
        );

    }

    get12Hour() {
        if (this.hours == 0) {
            return 12;
        }
        return this.hours - (12 * (this.hours > 12));
    }

    getMeridiem() {
        return (this.hours >= 12) ? 'PM' : 'AM';
    }

    toString() {
        return `${this.get12Hour()}:${leadingZero(this.minutes)} ${this.getMeridiem()}`;
    }

    compare(other) {
        // same hours
        let sh = this.hours == other.hours;

        // if equal (0)
        if (sh && this.minutes == other.minutes) {
            return 0;
        }

        // if this comes after (1)
        if (this.hours > other.hours)
            return 1;
        if (sh && this.minutes > other.minutes) 
            return 1;

        // if this comes before (-1)
        return -1;
    }

}

class Period {

    constructor(first, second, name='') {
        if (first.compare(second) !== -1) {
            throw new Error(`${first} does not come before ${second} in creating period ${name}`);
        }

        // range is inclusive
        this.first = first;
        this.second = second;

        this.name = name;
    }

    when(time) {
        let tf = time.compare(this.first);
        let ts = time.compare(this.second);

        let sum = tf + ts;

        // if before first and after second
        // OR is first or is second
        if (Math.abs(sum) <= 1) 
            return 0;

        // if after second (because it is after both)
        if (sum == 2)
            return +1;
        
        // (by elimination) if before
        return -1;

    }

    toString() {
        return `${this.name} (${this.first} - ${this.second})`
    }

}

const PERIODS = [
    new Period(new Time(00, 00), new Time(09, 10), 'Before school'),
    new Period(new Time(09, 10), new Time(10, 05), 'Period 1 / 6'),
    new Period(new Time(10, 15), new Time(11, 10), 'Period 2 / 7'),
    new Period(new Time(11, 20), new Time(12, 15), 'Period 3 / 8'),
    new Period(new Time(12, 25), new Time(13, 20), 'Period 4 / 9'),
    new Period(new Time(13, 30), new Time(14, 25), 'Period 5 / 10'),
    new Period(new Time(14, 30), new Time(14, 50), 'Office Hours'),
    new Period(new Time(14, 50), new Time(23, 59), 'After School')
];

/**
 * takes in a time object and sorted list of periods.
 * 
 * The periods should be sorted, but two consecutive periods can
 * overlap or be non-adjacent. As long as a period starts before 
 * the next period.
 * 
 * If a time is between two periods or a time falls in the overlap 
 * of two periods, all the periods will be returned. 
 * 
 * 
 * @param {Time} time 
 * @param {Period[]} periods 
 */
function findPeriod(time, periods = PERIODS) {
    // TODO: replace with binary search ??

    return findPeriodIterative(time, periods);
}

function findPeriodIterative(time, periods) {
    let out = [];

    for (let i = 0; i < periods.length; ++i) {
        let period = periods[i];

        let when = period.when(time);

        if (when == 0) {
            out.push(period);
        } 
        else if (when == -1 && i > 0) {
            let before = periods[i-1];

            if (before.when(time) == 1) {
                out.push(period);
                out.push(before);
            }
        }
    }

    return out
}

function testFind(time, expectedPeriods) {
    let periods = findPeriod(time);

    let got = "Got: ";
    periods.forEach(period => got += `(${period}) `);
    
    let expected = "Expected: ";
    expectedPeriods.forEach(period => expected += `(${period}) `);

    // this multiline string is ugly but i like how it looks
    console.log(`
At ${time}:
${got}
${expected}
`);
}

testFind(new Time(8, 05), [ PERIODS[0] ]);
testFind(new Time(9, 10), [ PERIODS[0], PERIODS[1] ]);
testFind(new Time(11, 15), [ PERIODS[2], PERIODS[3]] );
testFind(Time.now(), [ 'unsure' ]);