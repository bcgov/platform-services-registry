import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent } from '@/core/responses';
import { searchPublicCloudRequests } from '@/services/db';
import { publicCloudRequestSearchBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const { page, pageSize, ...filters } = body;

  const { docs } = await searchPublicCloudRequests({
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
  }));

  return CsvResponse(data, 'public-cloud-requests.csv');
});
