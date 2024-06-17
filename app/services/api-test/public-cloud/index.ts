import { PUT as _provisionPublicCloudProject } from '@/app/api/public-cloud/provision/[licencePlate]/route';
import { createRoute } from '../core';

const publicCloudRoute = createRoute('/public-cloud');

export async function provisionPublicCloudProject(licencePlate: string) {
  const result = await publicCloudRoute.put(_provisionPublicCloudProject, '/provision/{{licencePlate}}', null, {
    pathParams: { licencePlate },
  });

  return result;
}
