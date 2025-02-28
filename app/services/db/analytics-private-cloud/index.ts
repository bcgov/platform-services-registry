import { Cluster, Ministry } from '@prisma/client';
import { FetchKey } from '@/validation-schemas/analytics-private-cloud';
import { getActiveProducts } from './get-active-products';
import { getContactChangeRequests } from './get-contact-changes';
import { getPrivateLicencePlates } from './get-licencePlates';
import { ministryDistributions } from './get-ministry-distributions';
import { getQuotaChangeRequests } from './get-quota-change';
import { getRequestDecisionTime } from './get-request-decision-time';
import { getAllRequests } from './get-requests';

export async function privateCloudAnalytics({
  userId,
  ministries,
  clusters,
  dates = [],
  temporary = [],
  fetchKey,
}: {
  userId?: string;
  clusters?: Cluster[];
  ministries?: Ministry[];
  dates?: string[];
  temporary?: string[];
  fetchKey?: FetchKey;
}) {
  console.log('fetchKey', fetchKey);
  const licencePlatesList = await getPrivateLicencePlates({ userId, ministries, clusters, temporary });
  const dateFilter = dates?.length === 2 ? { createdAt: { gte: new Date(dates[0]), lte: new Date(dates[1]) } } : {};
  const fetchFunctions = {
    contactsChange: () => getContactChangeRequests({ licencePlatesList, dateFilter }),
    allRequests: () => getAllRequests({ licencePlatesList, dateFilter }),
    quotaChange: () => getQuotaChangeRequests({ licencePlatesList, dateFilter }),
    activeProducts: () => getActiveProducts({ licencePlatesList, dateFilter, clustersOptions: clusters }),
    requestDecisionTime: () => getRequestDecisionTime({ licencePlatesList, dateFilter }),
    ministryDistributionData: () => ministryDistributions({ licencePlatesList, dates }),
  };

  if (fetchKey) {
    const result = await fetchFunctions[fetchKey]();
    return { [fetchKey]: result };
  }

  const results = await Promise.all(Object.values(fetchFunctions).map((fn) => fn()));

  return Object.fromEntries(Object.keys(fetchFunctions).map((key, index) => [key, results[index]]));
}
