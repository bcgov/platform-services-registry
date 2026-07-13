/**
 * Quarter and billing-period helpers for public cloud accountability workflows.
 *
 * Quarterly forecast reviews track calendar quarters; the `fiscalYear` field on
 * QuarterlyForecastReview stores the calendar year the quarter falls in. (The
 * forecast grid itself groups months by BC fiscal year, April–March — see
 * components/public-cloud/accountability/forecast-grid-utils.ts.)
 */

export function getCurrentBillingPeriod(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getCurrentQuarter(date = new Date()) {
  const month = date.getMonth() + 1;
  return { fiscalYear: date.getFullYear(), quarter: Math.ceil(month / 3) };
}

/**
 * M+1 is the first day of the second month of the quarter — the month after the
 * forecast-due month (M, the first month of the quarter). Reviews not signed off
 * by this date are escalated.
 */
export function getMPlusOneDate(fiscalYear: number, quarter: number) {
  const quarterStartMonth = (quarter - 1) * 3 + 1;
  // Passing the 1-based quarter start month as a 0-based month index yields the
  // first day of the following month.
  return new Date(fiscalYear, quarterStartMonth, 1);
}

export function getDaysUntilMPlusOne(fiscalYear: number, quarter: number, from = new Date()) {
  const mPlusOne = getMPlusOneDate(fiscalYear, quarter);
  return Math.ceil((mPlusOne.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}
