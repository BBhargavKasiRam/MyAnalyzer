/**
 * Date and Time utilities for IST (Asia/Kolkata) timezone
 */

const IST_TIMEZONE = 'Asia/Kolkata';

const istFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/**
 * Converts a Date object, ISO string, or timestamp to YYYY-MM-DD in IST
 * @param {Date|string|number} dateInput
 * @returns {string} YYYY-MM-DD
 */
function toISTDateString(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return istFormatter.format(d);
}

/**
 * Returns today's date in IST as YYYY-MM-DD
 * @returns {string}
 */
function getTodayIST() {
  return istFormatter.format(new Date());
}

/**
 * Returns yesterday's date in IST as YYYY-MM-DD
 * @returns {string}
 */
function getYesterdayIST() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return istFormatter.format(d);
}

/**
 * Returns an array of YYYY-MM-DD strings for the past N days up to today in IST
 * @param {number} days - default 365
 * @returns {string[]}
 */
function getPastDaysIST(days = 365) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(istFormatter.format(d));
  }
  return result;
}

/**
 * Calculates current streak and longest streak from a set or map of active dates { [dateString]: count }
 * In IST timezone:
 * - If today has activity (count > 0), streak counts backward from today.
 * - If today has 0 but yesterday has activity, streak counts backward from yesterday.
 * - Otherwise current streak is 0.
 *
 * @param {Map<string, number> | Record<string, number>} dateCountsMap - YYYY-MM-DD -> count
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
function calculateStreaks(dateCountsMap) {
  // Normalize to Map
  const map = dateCountsMap instanceof Map ? dateCountsMap : new Map(Object.entries(dateCountsMap || {}));

  // Filter dates with count > 0 and sort ascending
  const activeDates = Array.from(map.entries())
    .filter(([_, count]) => count > 0)
    .map(([date]) => date)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate longest streak across all active dates
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  for (const dateStr of activeDates) {
    const currentDate = new Date(dateStr + 'T00:00:00Z');
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currentDate;
  }

  // Calculate current streak relative to today/yesterday in IST
  const today = getTodayIST();
  const yesterday = getYesterdayIST();

  const activeSet = new Set(activeDates);
  let currentStreak = 0;

  // Determine starting point
  let checkDate = null;
  if (activeSet.has(today)) {
    checkDate = new Date(today + 'T00:00:00Z');
  } else if (activeSet.has(yesterday)) {
    checkDate = new Date(yesterday + 'T00:00:00Z');
  }

  if (checkDate) {
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

module.exports = {
  IST_TIMEZONE,
  toISTDateString,
  getTodayIST,
  getYesterdayIST,
  getPastDaysIST,
  calculateStreaks
};
