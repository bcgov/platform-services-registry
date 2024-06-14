import { PUT as _provisionPrivateCloudProject } from '@/app/api/private-cloud/provision/[licencePlate]/route';
import { createRoute } from '../core';

const privateCloudRoute = createRoute('/private-cloud');

export async function provisionPrivateCloudProject(licencePlate: string) {
  const result = await privateCloudRoute.put(_provisionPrivateCloudProject, '/provision/{{licencePlate}}', null, {
    pathParams: { licencePlate },
  });

  return result;
}
