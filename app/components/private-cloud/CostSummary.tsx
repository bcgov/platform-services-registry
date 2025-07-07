import { monthNames } from '@/constants/common';
import { MonthlyCost, QuarterlyCost, TimeView, YearlyCost } from '@/types/private-cloud';
import { getDaysBetweenDates, extractDateRanges, formatCurrency, getQuarterValue, cn } from '@/utils/js';

const ProgressArrow = () => {
  const baseArrowClass =
    'absolute w-0 h-0 border-x-[12px] border-x-transparent border-t-[16px] left-1/2 -translate-x-1/2';
  return (
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-4 ">
      <div className="relative w-full h-full">
        <div className={cn(baseArrowClass, 'top-[2px] border-t-gray-300 opacity-40')} />
        <div className={cn(baseArrowClass, 'top-0 border-t-white')} />
      </div>
    </div>
  );
};

export default function CostSummary({
  data,
  selectedDate,
  viewMode,
}: {
  data: MonthlyCost | YearlyCost | QuarterlyCost;
  selectedDate: Date;
  viewMode: TimeView;
}) {
  if (!data) return null;

  const currentDate = new Date();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentMonthDay = currentDate.getDate();
  const currentDay = getDaysBetweenDates(data.startDate, currentDate);

  const hasCurrentTotal = data.currentTotal !== -1;
  const hasEstimatedTotal = data.estimatedGrandTotal !== -1;
  const hasGrandTotal = data.grandTotal !== -1;

  const { startDate, endDate } = extractDateRanges(data.billingPeriod);
  const isDifferentMonth = currentMonth !== startDate.split(' ')[0];

  const currentMonthQuater = getQuarterValue(currentDate.getMonth() + 1);
  const selectedMonthQuarter = getQuarterValue(new Date(data.startDate).getMonth() + 1);

  const calculateProgress = {
    [TimeView.Monthly]: () => {
      if (selectedDate.getMonth() === currentDate.getMonth()) return (currentDay * 100) / data.numberOfDaysBetweenDates;
      if (selectedDate.getMonth() > currentDate.getMonth()) return 0;
      return isDifferentMonth ? 100 : (currentDay * 100) / data.numberOfDaysBetweenDates;
    },
    [TimeView.Quarterly]: () => {
      if (selectedMonthQuarter > currentMonthQuater) return 0;
      return currentMonthQuater > selectedMonthQuarter ? 100 : (currentDay * 100) / data.numberOfDaysBetweenDates;
    },
    [TimeView.Yearly]: () => {
      if (selectedDate.getFullYear() < currentDate.getFullYear()) return 100;
      return selectedDate.getFullYear() > currentDate.getFullYear()
        ? 0
        : (currentDay * 100) / data.numberOfDaysBetweenDates;
    },
  };

  const percentageProgress = Math.min(100, calculateProgress[viewMode]());
  const getAppropriateCost = () => {
    const isBoundary = percentageProgress === 0 || percentageProgress === 100;
    const useGrandTotal =
      (viewMode === TimeView.Quarterly && currentMonthQuater !== selectedMonthQuarter) ||
      (viewMode !== TimeView.Quarterly && isBoundary);

    if (useGrandTotal && data.grandTotal !== -1) return data.grandTotal;
    if (data.estimatedGrandTotal !== -1) return data.estimatedGrandTotal;
    return 0;
  };

  const projectedCost = formatCurrency(getAppropriateCost());

  return (
    <div className="space-y-8 mb-10">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold mb-4">Summary</h1>
          <p className="mb-1">
            <strong>Current billing period:</strong> {data.billingPeriod}
          </p>
          <p className="mb-16">
            <strong>Account coding:</strong> {data.accountCoding}
          </p>
        </div>
      </div>
      <div className="relative">
        {
          <div className="flex items-center gap-4 gap-x-20">
            <p className="text-md flex-shrink-0">
              Current billing period
              <br />
              starts at <strong>{startDate}</strong>
            </p>

            <div className="flex-1 relative">
              <div className="w-full bg-gray-100 rounded-full h-4 mb-2 border border-gray-200 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentageProgress}%` }}
                ></div>
              </div>

              <div
                className="absolute top-0 transition-all duration-500"
                style={{
                  left: `${percentageProgress}%`,
                  transform: 'translateX(-50%)',
                  marginTop: '-100px',
                }}
              >
                {hasCurrentTotal && (
                  <div
                    className={cn(
                      'relative bg-white border border-gray-200 rounded-lg shadow-sm p-3 w-64 max-w-xs text-center',
                      {
                        'opacity-100': percentageProgress > 0,
                        'opacity-0': percentageProgress <= 0,
                      },
                      'transition-opacity duration-500',
                    )}
                  >
                    <p className="text-2xl font-bold mb-1">{formatCurrency(data.currentTotal)}</p>
                    <p className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                      Cost to date at{' '}
                      <strong className="text-gray-800">
                        {}
                        {currentMonth} {currentMonthDay}
                      </strong>
                    </p>
                    {ProgressArrow()}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4 gap-x-20">
              {hasEstimatedTotal && <p className="text-2xl font-bold">{projectedCost}</p>}
              {hasGrandTotal && <p className="text-2xl font-bold">{projectedCost}</p>}
              <p className="text-md">
                Projected cost at <strong>{endDate}</strong>
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
