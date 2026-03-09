/**
 * Add a given number of weeks to a date.
 * Returns a Date object.
 */
const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

/**
 * Format a Date to "YYYY-MM-DD" for MySQL DATE columns.
 */
const toMysqlDate = (date = new Date()) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Generate monthly due dates starting from a given date.
 * Returns an array of ISO date strings.
 */
const generateMonthlyDates = (startDate, months) => {
  const dates = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i + 1);
    dates.push(toMysqlDate(d));
  }
  return dates;
};

module.exports = { addWeeks, toMysqlDate, generateMonthlyDates };
