import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent } from '@/core/responses';
import { searchPrivateCloudRequests } from '@/services/db';
import { privateCloudRequestSearchBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: privateCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const { page, pageSize, ...filters } = body;

  const { docs } = await searchPrivateCloudRequests({
    ...filters,
    session,
    forExport: true,
  });

  if (docs.length === 0) {
    return NoContent();
  }

  const data = docs.map((request) => ({
    'Licence Plate': request.licencePlate,
    'Request Type': request.type,
    Status: request.decisionStatus,
    'Created At': request.createdAt.toISOString(),
    'Updated At': request.updatedAt.toISOString(),
    'Quota Changed': request.isQuotaChanged ?? false ? 'YES' : 'NO',
  }));

  return CsvResponse(data, 'private-cloud-requests.csv');
});
