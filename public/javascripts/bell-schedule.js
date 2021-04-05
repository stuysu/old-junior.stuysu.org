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
        // if the hours are the same, we must look at minutes
        if (this.hours == other.hours) {
            return Math.sign(this.minutes - other.minutes);
        }

        // if hours are different, just compare them
        return Math.sign(this.hours - other.hours);
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

    compare(other) {
        // whichever one starts first
        return this.first.compare(other.first);
    }

    toString() {
        return `${this.name} (${this.first} - ${this.second})`
    }

}

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
function findPeriod(time, periods) {
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

// testFind(new Time(8, 05), [ PERIODS[0] ]);
// testFind(new Time(9, 10), [ PERIODS[1] ]);
// testFind(new Time(11, 15), [ PERIODS[2], PERIODS[3]] );
// testFind(Time.now(), [ 'the period now' ]);