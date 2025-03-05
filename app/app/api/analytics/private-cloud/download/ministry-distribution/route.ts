import { Cluster } from '@prisma/client';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { mapClusterData, validClusters } from '@/helpers/ministry-data';
import { getPrivateLicencePlates } from '@/services/db/analytics/private-cloud/licence-plates';
import { getMinistryDistributions } from '@/services/db/analytics/private-cloud/ministry-distributions';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const { dates, clusters: requestedClusters } = body;
  const filteredClusters = requestedClusters?.filter((cluster) =>
    validClusters.includes(cluster as Cluster),
  ) as Cluster[];
  const selectedClusters = filteredClusters.length ? filteredClusters : validClusters;
  const licencePlatesList = await getPrivateLicencePlates(body);
  const data = await getMinistryDistributions({ licencePlatesList, dates });

  if (!data || !Array.isArray(data) || data.length === 0) return NoContent();

  const mappedClusterData = mapClusterData(selectedClusters, data);

  const formattedData = Object.entries(mappedClusterData).flatMap(([cluster, ministries]) =>
    ministries.map(({ label, value }) => ({
      Cluster: cluster,
      Ministry: label,
      Value: value,
    })),
  );

  return CsvResponse(formattedData, `analytics-private-cloud-ministry-distributions.csv`);
});
