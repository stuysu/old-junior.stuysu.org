function validateRange(t,e,r,i="a value",s=!0){if(s&&t<e||t>r)throw new Error(`${i} (${t}) is outside valid range [${e}, ${r}]`);return t>r?r:t<e?e:t}function leadingZero(t){return t<10?`0${t}`:`${t}`}class Time{static now(){return Time.fromDate(new Date(Date.now()))}static fromDate(t){return new Time(t.getHours(),t.getMinutes())}static fromTime(t){return new Time(t.hours,t.minutes)}constructor(t,e){this.hours=validateRange(t,0,23,"hours"),this.minutes=validateRange(e,0,59,"minutes")}get12Hour(){return 0==this.hours?12:this.hours-12*(this.hours>12)}getMeridiem(){return this.hours>=12?"PM":"AM"}toString(){return`${this.get12Hour()}:${leadingZero(this.minutes)} ${this.getMeridiem()}`}compare(t){return this.hours==t.hours?Math.sign(this.minutes-t.minutes):Math.sign(this.hours-t.hours)}add(t){let e=this.minutes+t.minutes,r=e-60;r>=0?(e=r,r=1):r=0;let i=this.hours+t.hours+r;return i%=24,new Time(i,e)}totalMinutes(){return 60*this.hours+this.minutes}totalHours(){return this.hours+this.minutes/60}minutesBetween(t){let e=this.hours-t.hours,r=this.minutes-t.minutes;return Math.abs(60*e+r)}hoursBetween(t){let e=this.hours-t.hours,r=this.minutes-t.minutes;return Math.abs(e+r/60)}}class Period{constructor(t,e,r={}){if(-1!==t.compare(e))throw new Error(`${t} does not come before ${e} in creating period ${name}`);this.first=t,this.second=e,this.payload=r}when(t){let e=t.compare(this.first)+t.compare(this.second);return Math.abs(e)<=1?0:2==e?1:-1}compare(t){return this.first.compare(t.first)}toString(){return`${this.payload} (${this.first} - ${this.second})`}}function findPeriod(t,e){return findPeriodIterative(t,e)}function findPeriodIterative(t,e){let r=[];for(let i=0;i<e.length;++i){let s=e[i],n=s.when(t);if(0==n)r.push(s);else if(-1==n&&i>0){let n=e[i-1];1==n.when(t)&&(r.push(s),r.push(n))}}return r}function testFind(t,e){let r=findPeriod(t),i="Got: ";r.forEach((t=>i+=`(${t}) `));let s="Expected: ";e.forEach((t=>s+=`(${t}) `)),console.log(`\nAt ${t}:\n${i}\n${s}\n`)}
