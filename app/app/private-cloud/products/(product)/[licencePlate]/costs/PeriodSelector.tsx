import { Select, Switch, Tooltip } from '@mantine/core';
import { MonthPickerInput, YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { getMonthlyCosts, getQuarterlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';
import { PeriodCosts, CostPeriod } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';
import { formatAsYearQuarter, getDateFromYyyyMmDd } from '@/utils/js';
import { useCostState } from './state';

const inputClasses = 'border-gray-600 focus:border-gray-800 dark:border-gray-500 dark:focus:border-gray-300';

const switchStyles = (enabled: boolean) => ({
  track: {
    cursor: 'pointer',
    backgroundColor: enabled ? '#0D5EA6' : undefined,
  },
});

export default function PeriodSelector({ licencePlate }: { licencePlate: string }) {
  const [state, snap] = useCostState();

  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, snap.period, snap.selectedDate],
    queryFn: () => {
      console.log('here');
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
    if (data) state.data = data;
  }, [data]);

  const isMonthPicker = snap.period === CostPeriod.Monthly || snap.period === CostPeriod.Quarterly;

  const handlePeriodChange = (value: string | null) => (state.period = value as CostPeriod);
  const handleDateChange = (value: string | null) =>
    (state.selectedDate = value ? getDateFromYyyyMmDd(value) : new Date());

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
        {/*
        <Switch
          label="Forecast"
          checked={forecastEnabled}
          onChange={(event) => onForecastChange(event.currentTarget.checked)}
          classNames={{
            label: 'cursor-pointer',
            thumb: 'cursor-pointer',
          }}
          styles={switchStyles(forecastEnabled)}
        /> */}
      </div>
    </div>
  );
}
