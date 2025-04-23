import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { mapProviderData, validProviders } from '@/helpers/ministry-data';
import { Provider } from '@/prisma/client';
import { getPublicLicencePlates } from '@/services/db/analytics/public-cloud/licence-plates';
import { getMinistryDistributions } from '@/services/db/analytics/public-cloud/ministry-distributions';
import { analyticsPublicCloudFilterSchema } from '@/validation-schemas/analytics-public-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  validations: { body: analyticsPublicCloudFilterSchema },
})(async ({ session, body }) => {
  const { dates, providers: requestedProviders } = body;
  const filteredProviders = requestedProviders?.filter((provider) =>
    validProviders.includes(provider as Provider),
  ) as Provider[];
  const selectedProviders = filteredProviders.length ? filteredProviders : validProviders;
  const licencePlatesList = await getPublicLicencePlates(body);
  const data = await getMinistryDistributions({ licencePlatesList, dates });

  if (!data || !Array.isArray(data) || data.length === 0) return NoContent();

  const mappedProviderData = mapProviderData(selectedProviders, data);

  const formattedData = Object.entries(mappedProviderData).flatMap(([provider, ministries]) =>
    ministries.map(({ label, value }) => ({
      Provider: provider,
      Ministry: label,
      Value: value,
    })),
  );

  return CsvResponse(formattedData, `analytics-public-cloud-ministry-distributions.csv`);
});
