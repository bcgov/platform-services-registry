import { Provider, Ministry } from '@/prisma/types';
import { getActiveProducts } from './active-products';
import { getAllRequests } from './all-requests';
import { getContactChangeRequests } from './contact-changes';
import { getPublicLicencePlates } from './licence-plates';
import { getMinistryDistributions } from './ministry-distributions';
import { getRequestDecisionTime } from './request-decision-time';

export async function getPublicCloudAnalytics({
  userId,
  ministries,
  providers,
  dates = [],
}: {
  userId?: string;
  providers?: Provider[];
  ministries?: Ministry[];
  dates?: string[];
}) {
  const licencePlatesList = await getPublicLicencePlates({ userId, ministries, providers });
  const dateFilter = dates?.length === 2 ? { createdAt: { gte: new Date(dates[0]), lte: new Date(dates[1]) } } : {};
  const [contactsChange, allRequests, activeProducts, requestDecisionTime, ministryDistributionData] =
    await Promise.all([
      getContactChangeRequests({ licencePlatesList, dateFilter }),
      getAllRequests({ licencePlatesList, dateFilter }),
      getActiveProducts({ licencePlatesList, dateFilter, providersOptions: providers }),
      getRequestDecisionTime({ licencePlatesList, dateFilter }),
      getMinistryDistributions({ licencePlatesList, dates }),
    ]);

  return { contactsChange, allRequests, activeProducts, requestDecisionTime, ministryDistributionData };
}
