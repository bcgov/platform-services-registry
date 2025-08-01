import { monthNames } from '@/constants/common';
import { PeriodCosts, CostPeriod } from '@/types/private-cloud';
import { extractDateRanges, formatCurrency, getQuarterValue } from '@/utils/js';

export default function CostSummary({
  data,
  period,
  isFromPDFDownloader = false,
}: {
  data: PeriodCosts;
  period: CostPeriod;
  isFromPDFDownloader?: boolean;
}) {
  if (!data) return null;

  const currentDate = new Date();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentMonthDay = currentDate.getDate();

  const hasCurrentTotal = data.currentTotal !== -1;
  const hasEstimatedTotal = data.estimatedGrandTotal !== -1;
  const hasGrandTotal = data.grandTotal !== -1;

  const { startDate, endDate } = extractDateRanges(data.billingPeriod);

  const currentMonthQuater = getQuarterValue(currentDate.getMonth() + 1);
  const selectedMonthQuarter = getQuarterValue(new Date(data.startDate).getMonth() + 1);

  const percentageProgress = data.progress * 100;
  const getAppropriateCost = () => {
    const isBoundary = percentageProgress === 0 || percentageProgress === 100;
    const useGrandTotal =
      (period === CostPeriod.Quarterly && currentMonthQuater !== selectedMonthQuarter) ||
      (period !== CostPeriod.Quarterly && isBoundary);

    if (useGrandTotal && data.grandTotal !== -1) return data.grandTotal;
    if (data.estimatedGrandTotal !== -1) return data.estimatedGrandTotal;
    return 0;
  };

  const projectedCost = formatCurrency(getAppropriateCost());

  return (
    <div className="mb-5">
      <div className="flex items-center">
        <div>
          <div className="text-3xl font-bold mb-4">Summary</div>
          <div className="mb-1">
            <strong>Current period:</strong> {data.billingPeriod}
          </div>
          <div className="mb-5">
            <strong>Account coding:</strong> {data.accountCoding}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-x-20">
          <div className="text-md shrink-0">
            Current period
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
