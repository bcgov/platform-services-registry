import { Select, Switch, Tooltip } from '@mantine/core';
import { MonthPickerInput, YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { getMonthlyCosts, getQuarterlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';
import { CostPeriod } from '@/types/private-cloud';
import { formatAsYearQuarter, getDateFromYyyyMmDd } from '@/utils/js';
import ForecastTooltip from './ForecastTooltip';
import { costActions, useCostState } from './state';

const inputClasses = 'border-gray-600 focus:border-gray-800 dark:border-gray-500 dark:focus:border-gray-300';

const switchStyles = (enabled: boolean) => ({
  track: {
    cursor: 'pointer',
    backgroundColor: enabled ? '#0D5EA6' : undefined,
  },
});

export default function PeriodSelector({
  licencePlate,
  children,
}: {
  licencePlate: string;
  children?: React.ReactNode;
}) {
  const [, snap] = useCostState();

  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, snap.period, snap.selectedDate],
    queryFn: () => {
      if (snap.period === CostPeriod.Monthly) {
        return getMonthlyCosts(licencePlate, format(snap.selectedDate, 'yyyy-MM'));
      }

      if (snap.period === CostPeriod.Quarterly) {
        return getQuarterlyCosts(licencePlate, formatAsYearQuarter(snap.selectedDate));
      }

      return getYearlyCosts(licencePlate, snap.selectedDate.getFullYear().toString());
    },
    enabled: !!licencePlate && !!snap.selectedDate,
  });

  useEffect(() => {
    costActions.setIsDataLoading(isLoading);
    if (data) costActions.setData(data);
  }, [data, isLoading]);

  const isMonthPicker = snap.period === CostPeriod.Monthly || snap.period === CostPeriod.Quarterly;

  const handlePeriodChange = (value: string | null) => {
    if (!value) return;
    costActions.setPeriod(value as CostPeriod);
  };
  const handleDateChange = (value: string | null) => {
    costActions.setSelectedDate(value ? getDateFromYyyyMmDd(value) : new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex px-8 bg-zinc-100 items-center justify-between w-full border-b">
        <div className="flex items-center gap-4 py-7">
          <Tooltip label="Select Mode">
            <Select
              placeholder="Select Mode"
              value={snap.period}
              data={Object.values(CostPeriod)}
              onChange={handlePeriodChange}
              classNames={{ input: inputClasses }}
            />
          </Tooltip>

          <Tooltip label={`Select a ${isMonthPicker ? 'month' : 'year'}`}>
            {isMonthPicker ? (
              <MonthPickerInput
                placeholder="Select a month"
                maw={200}
                value={snap.selectedDate}
                onChange={handleDateChange}
                classNames={{ input: inputClasses }}
              />
            ) : (
              <YearPickerInput
                placeholder="Select a year"
                maw={200}
                value={snap.selectedDate}
                onChange={handleDateChange}
                classNames={{ input: inputClasses }}
              />
            )}
          </Tooltip>
        </div>
        <ForecastTooltip>
          <Switch
            label="Forecast"
            checked={snap.forecast}
            onChange={(event) => costActions.setForecast(event.currentTarget.checked)}
            classNames={{
              label: 'cursor-pointer',
              thumb: 'cursor-pointer',
            }}
            styles={switchStyles(snap.forecast)}
          />
        </ForecastTooltip>
      </div>
      {children}
    </div>
  );
}
