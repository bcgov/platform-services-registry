import { Select, Switch, Tooltip } from '@mantine/core';
import { MonthPickerInput, YearPickerInput } from '@mantine/dates';
import { format } from 'date-fns';
import { PeriodCosts, CostPeriod } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

const inputClasses = 'border-gray-600 focus:border-gray-800 dark:border-gray-500 dark:focus:border-gray-300';

const switchStyles = (enabled: boolean) => ({
  track: {
    cursor: 'pointer',
    backgroundColor: enabled ? '#0D5EA6' : undefined,
  },
});

export default function PeriodSelector({
  selectedDate,
  handleDateChange,
  viewMode,
  onModeChange,
  onForecastChange,
  forecastEnabled,
  showForecastSwitch = true,
  showTable = false,
  data,
}: {
  selectedDate: Date;
  handleDateChange: (date: string | null) => void;
  viewMode: CostPeriod;
  onModeChange: (mode: CostPeriod) => void;
  onForecastChange: (enabled: boolean) => void;
  forecastEnabled: boolean;
  showForecastSwitch?: boolean;
  showTable?: boolean;
  data: PeriodCosts;
}) {
  const handleModeChange = (value: string | null) => {
    if (value && Object.values(CostPeriod).includes(value as CostPeriod)) {
      onModeChange(value as CostPeriod);
    }
  };

  const isMonthPicker = viewMode === CostPeriod.Monthly || viewMode === CostPeriod.Quarterly;
  const currentMonth = format(selectedDate, 'MMMM');

  return (
    <div className="space-y-4">
      <div className="flex px-8 bg-zinc-100 items-center justify-between w-full border-b">
        <div className="flex items-center gap-4 py-7">
          <Tooltip label="Select Mode">
            <Select
              placeholder="Select Mode"
              value={viewMode}
              data={Object.values(CostPeriod)}
              onChange={handleModeChange}
              classNames={{ input: inputClasses }}
            />
          </Tooltip>

          <Tooltip label={`Select a ${isMonthPicker ? 'month' : 'year'}`}>
            {isMonthPicker ? (
              <MonthPickerInput
                placeholder="Select a month"
                maw={200}
                value={selectedDate}
                onChange={handleDateChange}
                classNames={{ input: inputClasses }}
              />
            ) : (
              <YearPickerInput
                placeholder="Select a year"
                maw={200}
                value={selectedDate}
                onChange={handleDateChange}
                classNames={{ input: inputClasses }}
              />
            )}
          </Tooltip>
        </div>

        {showForecastSwitch && (
          <Switch
            label="Forecast"
            checked={forecastEnabled}
            onChange={(event) => onForecastChange(event.currentTarget.checked)}
            classNames={{
              label: 'cursor-pointer',
              thumb: 'cursor-pointer',
            }}
            styles={switchStyles(forecastEnabled)}
          />
        )}
      </div>

      <div className="flex justify-between">
        {!showTable &&
          data &&
          [
            {
              condition: data.currentTotal !== -1,
              value: data.currentTotal,
              label:
                viewMode === CostPeriod.Monthly
                  ? `Current total cost for ${currentMonth}`
                  : `Current total cost for ${data.billingPeriod}`,
            },
            {
              condition: data.grandTotal !== -1,
              value: data.grandTotal,
              label:
                viewMode === CostPeriod.Monthly
                  ? `Grand total cost for ${currentMonth}`
                  : `Grand total cost for ${data.billingPeriod}`,
            },
            {
              condition: data.estimatedGrandTotal !== -1 && forecastEnabled,
              value: data.estimatedGrandTotal,
              label:
                viewMode === CostPeriod.Monthly
                  ? `Estimated grand total cost for ${currentMonth}`
                  : `Estimated grand total cost for ${data.billingPeriod}`,
            },
          ].map(
            ({ condition, value, label }) =>
              condition && (
                <div
                  key={label}
                  className="inline-flex m-5 mt-4 p-2 px-5 mx-16 bg-zinc-100 items-center justify-between border border-gray-300 rounded-md"
                >
                  <strong>{label}:&nbsp;</strong>
                  {formatCurrency(value)}
                </div>
              ),
          )}
      </div>
    </div>
  );
}
