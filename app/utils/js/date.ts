import { format } from 'date-fns/format';
import { isEqual } from 'date-fns/isEqual';
import _isDate from 'lodash-es/isDate';
import _isNil from 'lodash-es/isNil';

export function formatDate(date: string | number | Date | null | undefined, formatStr = 'yyyy-MM-dd hh:mm:ss aa') {
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

export function isValidISODateString(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
}

type ValidDate = string | number | Date;
type PossibleDate = ValidDate | null | undefined;

export function isEqualDate(dt1: PossibleDate, dt2: PossibleDate) {
  const dtnil1 = _isNil(dt1);
  const dtnil2 = _isNil(dt2);

  if (dtnil1) dt1 = null;
  if (dtnil2) dt2 = null;

  if (dtnil1 || dtnil2) {
    return dtnil1 === dtnil2;
  }

  return isEqual(dt1 as ValidDate, dt2 as ValidDate);
}

export function isEqualDates(dt1: [Date | null, Date | null], dt2: [Date | null, Date | null]) {
  const dt11 = dt1[0];
  const dt12 = dt1[1];
  const dt21 = dt2[0];
  const dt22 = dt2[1];

  return isEqualDate(dt11, dt21) && isEqualDate(dt12, dt22);
}
