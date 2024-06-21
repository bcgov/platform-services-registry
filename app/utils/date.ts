import { format } from 'date-fns/format';
import _isDate from 'lodash/isDate';

export function formatDate(date: string | number | Date, formatStr = 'yyyy-MM-dd hh:mm:ss aa') {
  if (!date) return '';

  const d = new Date(date);
  if (!_isDate(d)) return '';

  return format(d, formatStr);
}

export function formatDateSimple(date: string | Date) {
  if (!date) return '';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);

  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

const shortDateFormat = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

export function dateToShortDateString(date: Date) {
  return shortDateFormat.format(date);
}

export function shortDateStringToDate(datestr: string) {
  return new Date(Date.parse(datestr));
}

export function compareYearMonth(date1: Date, date2: Date) {
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();

  if (year1 === year2 && month1 === month2) {
    return 0; // Dates are equal in year and month
  }

  if (year1 < year2 || (year1 === year2 && month1 < month2)) {
    return -1; // date1 is before date2
  }

  return 1; // date1 is after date2
}
