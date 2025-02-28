import { FetchKey, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { privateCloudAnalytics } from '@/services/db/analytics-private-cloud';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const { fetchKey, ...searchProps } = body as { fetchKey?: FetchKey };

  const data = await privateCloudAnalytics({ ...searchProps, fetchKey });

  if (!data || !fetchKey || !data[fetchKey]) {
    return NoContent();
  }

  let formattedData;

  switch (fetchKey) {
    case FetchKey.CONTACTS_CHANGE:
      formattedData = data[fetchKey].map((item) => ({
        Date: item.date,
        'Contact Changes': item['Contact changes'],
      }));
      break;

    case FetchKey.ALL_REQUESTS:
      formattedData = data[fetchKey].map((item) => ({
        Date: item.date,
        'All Requests': item['All requests'],
        'Edit Requests': item['Edit requests'],
        'Create Requests': item['Create requests'],
        'Delete Requests': item['Delete requests'],
      }));
      break;

    case FetchKey.QUOTA_CHANGE:
      formattedData = data[fetchKey].map((item) => ({
        Date: item.date,
        'All Quota Requests': item['All quota requests'],
        'Approved Quota Requests': item['Approved quota requests'],
        'Rejected Quota Requests': item['Rejected quota requests'],
      }));
      break;

    case FetchKey.ACTIVE_PRODUCTS:
      formattedData = data[fetchKey].map((item) => ({
        Date: item.date,
        'All Clusters': item['All Clusters'],
        ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'date' && key !== 'All Clusters')),
      }));
      break;

    case FetchKey.REQUEST_DECISION_TIME:
      formattedData = data[fetchKey].map((item) => ({
        'Time Interval': item.time,
        Percentage: item.Percentage,
      }));
      break;

    case FetchKey.USERS_QUOTA_EDIT_REQUEST:
      formattedData = data[fetchKey].map((item) => ({
        UserID: item.id,
        CreatedAt: item.createdAt,
        UpdatedAt: item.updatedAt,
        Ministry: item.ministry ?? 'N/A',
        ProviderUserID: item.providerUserId ?? 'N/A',
        FirstName: item.firstName ?? 'N/A',
        LastName: item.lastName ?? 'N/A',
        Email: item.email ?? 'N/A',
        LastSeen: item.lastSeen ?? 'N/A',
      }));
      break;

    case FetchKey.MINISTRY_DISTRIBUTION_DATA:
      formattedData = data[fetchKey].flat().map((item) => ({
        Ministry: item._id,
        Value: item.value,
      }));
      break;

    default:
      formattedData = data; // If no specific fetchKey, return entire dataset
  }

  return CsvResponse(formattedData, `analytics-private-cloud-${fetchKey}.csv`);
});
