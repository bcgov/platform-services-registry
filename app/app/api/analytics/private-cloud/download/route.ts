import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { privateCloudAnalytics } from '@/services/db/analytics-private-cloud';
import { analyticsPrivateCloudFilterSchema, FetchKey } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const { fetchKey, ...searchProps } = body as { fetchKey?: FetchKey };

  const data = await privateCloudAnalytics({ ...searchProps, fetchKey });

  if (!data || !fetchKey) {
    return NoContent();
  }

  let formattedData;
  switch (fetchKey) {
    case 'contactsChange':
      formattedData = data.contactsChange.map((item) => ({
        Date: item.date,
        'Contact Changes': item['Contact changes'],
      }));
      break;

    case 'allRequests':
      formattedData = data.allRequests.map((item) => ({
        Date: item.date,
        'All Requests': item['All requests'],
        'Edit Requests': item['Edit requests'],
        'Create Requests': item['Create requests'],
        'Delete Requests': item['Delete requests'],
      }));
      break;

    case 'quotaChange':
      formattedData = data.quotaChange.map((item) => ({
        Date: item.date,
        'All Quota Requests': item['All quota requests'],
        'Approved Quota Requests': item['Approved quota requests'],
        'Rejected Quota Requests': item['Rejected quota requests'],
      }));
      break;

    case 'activeProducts':
      formattedData = data.activeProducts.map((item) => ({
        Date: item.date,
        'All Clusters': item['All Clusters'],
        ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'date' && key !== 'All Clusters')),
      }));
      break;

    case 'requestDecisionTime':
      formattedData = data.requestDecisionTime.map((item) => ({
        'Time Interval': item.time,
        Percentage: item.Percentage,
      }));
      break;

    // case 'ministryDistributionData':
    //   formattedData = data.ministryDistributionData.flat().map((item) => ({
    //     Ministry: item.name,
    //     'Value': item.value,
    //   }));
    //   break;

    default:
      formattedData = data; // If no specific fetchKey, return everything as-is
  }

  return CsvResponse(formattedData, `analytics-private-cloud-${fetchKey ?? 'all'}.csv`);
});
