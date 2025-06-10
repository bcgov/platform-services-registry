import { format } from 'date-fns/format';
import { getQuarter } from 'date-fns/getQuarter';
import { isEqual } from 'date-fns/isEqual';
import _isDate from 'lodash-es/isDate';
import _isNil from 'lodash-es/isNil';
import { monthNames } from '@/constants/common';

export function formatDate(date: string | number | Date | null | undefined, formatStr = 'yyyy-MM-dd hh:mm:ss aa') {
  if (!date) return '';

  const d = new Date(date);
  if (!_isDate(d)) return '';

  return format(d, formatStr);
}

export function formatDateSimple(date: string | Date) {
  if (!date) return '';

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

export function getYyyyMmDd(date: Date) {
  return date.toISOString().substring(0, 10);
}

export function isLeapYear(year = new Date().getFullYear()) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getNumberOfDaysForYear(year = new Date().getFullYear()) {
  const leapYear = isLeapYear(year);
  return leapYear ? 366 : 365;
}

export function getMinutesInYear(year = new Date().getFullYear()) {
  return getNumberOfDaysForYear(year) * 24 * 60;
}

export function getDateFromYyyyMmDd(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function getMonthStartEndDate(year: number, oneIndexedMonth: number) {
  const startDate = new Date(year, oneIndexedMonth - 1, 1);
  const endDate = new Date(year, oneIndexedMonth, 1, 0, 0, 0, -1);
  return {
    startDate,
    endDate,
  };
}

export function getQuarterStartEndDate(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 1, 0, 0, 0, -1);
  return {
    startDate,
    endDate,
  };
}

export function getYearlyStartEndDate(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 12, 1, 0, 0, 0, -1);
  return {
    startDate,
    endDate,
  };
}

export function getQuarterMonths(quarter: number) {
  const startMonth = (quarter - 1) * 3 + 1; // Convert to 1-indexed
  return [startMonth, startMonth + 1, startMonth + 2];
}

export function getQuarterTitleWithMonths(year: number, quarter: number): string {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  return `Q${quarter} ${year} (${monthNames[startMonth]}–${monthNames[endMonth]})`;
}

export function compareDatesByDay(dateA: Date, dateB: Date, operator: string) {
  const dayA = new Date(dateA).toISOString().slice(0, 10);
  const dayB = new Date(dateB).toISOString().slice(0, 10);

  switch (operator) {
    case '<':
      return dayA < dayB;
    case '<=':
      return dayA <= dayB;
    case '>':
      return dayA > dayB;
    case '>=':
      return dayA >= dayB;
    case '!=':
      return dayA !== dayB;
    default:
      return dayA === dayB;
  }
}

export function compareDatesByMonth(dateA: Date, dateB: Date, operator: string) {
  const monthA = format(dateA, 'yyyy-MM');
  const monthB = format(dateB, 'yyyy-MM');

  switch (operator) {
    case '<':
      return monthA < monthB;
    case '<=':
      return monthA <= monthB;
    case '>':
      return monthA > monthB;
    case '>=':
      return monthA >= monthB;
    case '!=':
      return monthA !== monthB;
    default:
      return monthA === monthB;
  }
}

export function compareDatesByQuarter(dateA: Date, dateB: Date, operator: string) {
  const quarterA = `${format(dateA, 'yyyy')}-Q${getQuarter(dateA)}`;
  const quarterB = `${format(dateB, 'yyyy')}-Q${getQuarter(dateB)}`;

  switch (operator) {
    case '<':
      return quarterA < quarterB;
    case '<=':
      return quarterA <= quarterB;
    case '>':
      return quarterA > quarterB;
    case '>=':
      return quarterA >= quarterB;
    case '!=':
      return quarterA !== quarterB;
    default:
      return quarterA === quarterB;
  }
}

export function toStartOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatAsYearQuarter(date: Date) {
  const year = format(date, 'yyyy');
  const quarter = getQuarter(date);
  return `${year}-${quarter}`;
}

export function getMonthNameFromNumber(month: number): string {
  const date = new Date(2000, month - 1); // month is 0-indexed
  return format(date, 'LLLL');
}

export function getMonthsArrayFromDates(startDate: Date, endDate: Date): number[] {
  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  return Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i);
}

export function timeAgo(date: string | Date): string {
  if (!date) return '';

  const tdate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - tdate.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  if (years === 0) {
    return '1 year ago';
  }

  return `${years} year${years === 1 ? '' : 's'} ago`;
}
