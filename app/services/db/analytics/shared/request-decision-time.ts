import _isString from 'lodash-es/isString';
import _map from 'lodash-es/map';
import { getProvinceHolidays } from '@/services/canada-holidays';
import { getWorkdayDurationInMilliseconds, geDaysRoundedUp } from '@/utils/js';

export async function getChartDataForDecisionTime(
  requests: {
    createdAt: Date;
    decisionDate: Date | null;
  }[],
) {
  const holidays = await getProvinceHolidays('BC');
  const holidayDates = holidays.province.holidays.map((holiday) => holiday.date);

  const daysList = requests
    .filter((req) => req.decisionDate)
    .map((req) => {
      const workdayinMs = getWorkdayDurationInMilliseconds(req.createdAt, req.decisionDate!, holidayDates);
      const workdays = geDaysRoundedUp(workdayinMs);
      return workdays === 0 ? 1 : workdays;
    });

  if (daysList.length === 0) {
    return [];
  }

  const meta = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    over: 0,
  };

  for (let x = 0; x < daysList.length; x++) {
    if (daysList[x] > 7) meta.over++;
    else meta[daysList[x]]++;
  }

  const data = _map(meta, (val, key) => {
    const label =
      key === 'over' ? 'more than 7 business days' : `less than ${key} business day${key === '1' ? '' : 's'}`;

    return {
      time: label,
      percentage: (val / daysList.length) * 100,
    };
  });

  return data;
}
