/**
 * Return the number of whole days that have passed between time and now. For
 * example, if `time` corresponds to 1/1/20 11:59 PM and it is `now` 1/2/20
 * 12:00AM, the return value is 1, because although only 1 minute has passed,
 * the day (in local time) has changed
 */
export function getDaysSince(time: Date | number, now = Date.now()) {
  const midnight = (t: Date | number) => {
    t = t instanceof Date ? t : new Date(t);
    return new Date(t.toDateString()).valueOf();
  };

  // 24 * 60 * 60 * 1000 = 86400000
  return Math.floor((midnight(now) - midnight(time)) / 86400000);
}
