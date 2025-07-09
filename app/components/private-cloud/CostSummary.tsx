import { monthNames } from '@/constants/common';
import { MonthlyCost, QuarterlyCost, TimeView, YearlyCost } from '@/types/private-cloud';
import { getDaysBetweenDates, extractDateRanges, formatCurrency, getQuarterValue } from '@/utils/js';

export default function CostSummary({
  data,
  selectedDate,
  viewMode,
  isFromPDFDownloader = false,
}: {
  data: MonthlyCost | YearlyCost | QuarterlyCost;
  selectedDate: Date;
  viewMode: TimeView;
  isFromPDFDownloader: boolean;
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
          <div className="text-3xl font-bold mb-4">Summary</div>
          <div className="mb-1">
            <strong>Current billing period:</strong> {data.billingPeriod}
          </div>
          <div className="mb-16">
            <strong>Account coding:</strong> {data.accountCoding}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-4 gap-x-20">
          <div className="text-md flex-shrink-0">
            Current billing period
            <br />
            starts at <strong>{startDate}</strong>
          </div>

          <div className="flex-1 relative ml-9 mr-9">
            {hasCurrentTotal && (
              <div
                className="absolute top-0 duration-500 z-10"
                style={{
                  left: `${percentageProgress}%`,
                  transform: 'translateX(-50%)',
                  marginTop: '-100px',
                }}
              >
                <div
                  className={`relative text-center bg-transparent ${isFromPDFDownloader ? `-mt-20` : `mt-4`} ${
                    isFromPDFDownloader ? `ml-[${(percentageProgress * 450) / 100}px]` : ''
                  }`}
                >
                  <div className="text-2xl font-bold">{formatCurrency(data.currentTotal)}</div>
                  <div className="text-md text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                    Cost to date at{' '}
                    <strong className="text-gray-800">
                      {currentMonth} {currentMonthDay}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`w-full bg-gray-100 rounded-full ${
                isFromPDFDownloader ? 'h-2' : 'h-4'
              } mb-2 border border-gray-200 overflow-hidden`}
            >
              <div
                className={`bg-blue-500 h-full rounded-full transition-all duration-500 ${
                  isFromPDFDownloader ? `w-[${percentageProgress}%]` : ''
                }`}
                style={isFromPDFDownloader ? undefined : { width: `${percentageProgress}%` }}
              />
            </div>
          </div>
          <div className="mb-4 gap-x-20">
            <div>
              {hasEstimatedTotal && <div className="text-2xl font-bold">{projectedCost}</div>}
              {hasGrandTotal && <div className="text-2xl font-bold">{projectedCost}</div>}
              <div className="text-md">
                Projected cost at <strong>{endDate}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
