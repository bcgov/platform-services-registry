import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getMonthlyCosts } from '@/services/db/private-cloud-costs';
import { formatDateSimple } from '@/utils/js';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  'year-month': z.string(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, 'year-month': yearMonth } = pathParams;
  const [year, month] = yearMonth.split('-').map(Number);

  const monthlyData = await getMonthlyCosts(licencePlate, year, month);

  if (!monthlyData || !monthlyData.items || monthlyData.items.length === 0) {
    return NoContent();
  }

  const formattedData = monthlyData.items.map((item) => ({
    'Start Date': formatDateSimple(item.startDate),
    'End Date': formatDateSimple(item.endDate),
    'CPU cores': item.cpu,
    'Storage (GiB)': item.storage,
    'CPU Cost ($)': item.cpuCost.toFixed(2),
    'Storage Cost ($)': item.storageCost.toFixed(2),
    'Total Cost ($)': item.totalCost.toFixed(2),
  }));

  return CsvResponse(formattedData, `monthly-costs-${yearMonth}.csv`);
});
