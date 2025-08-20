import { startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { Cluster } from '@/prisma/client';
import { getActiveProducts } from './active-products';
import { getAllRequests } from './all-requests';
import { getContactChangeRequests } from './contact-changes';
import { getPrivateLicencePlates } from './licence-plates';
import { getMinistryDistributions } from './ministry-distributions';
import { getQuotaChangeRequests } from './quota-change';
import { getRequestDecisionTime } from './request-decision-time';

export async function getPrivateCloudAnalytics({
  userId,
  ministries,
  clusters,
  dates = [],
  temporary = [],
}: {
  userId?: string;
  clusters?: Cluster[];
  ministries?: string[];
  dates?: string[];
  temporary?: string[];
}) {
  const licencePlatesList = await getPrivateLicencePlates({ userId, ministries, clusters, temporary });

  const dateFilter =
    dates.length === 2
      ? {
          createdAt: {
            gte: fromZonedTime(startOfDay(new Date(dates[0])), 'America/Vancouver'),
            lte: fromZonedTime(endOfDay(new Date(dates[1])), 'America/Vancouver'),
          },
        }
      : {};

  const [contactsChange, allRequests, quotaChange, activeProducts, requestDecisionTime, ministryDistributionData] =
    await Promise.all([
      getContactChangeRequests({ licencePlatesList, dateFilter }),
      getAllRequests({ licencePlatesList, dateFilter }),
      getQuotaChangeRequests({ licencePlatesList, dateFilter }),
      getActiveProducts({ licencePlatesList, dateFilter, clustersOptions: clusters }),
      getRequestDecisionTime({ licencePlatesList, dateFilter }),
      getMinistryDistributions({ licencePlatesList, dates }),
    ]);

  return { contactsChange, allRequests, quotaChange, activeProducts, requestDecisionTime, ministryDistributionData };
}
