import { getPrivateCloudProjectsQuery, getPrivateCloudProjectsResult } from '@/queries/private-cloud/helpers';

export async function privateCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | string[] | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
  ministryRoles?: string[],
): Promise<any> {
  // Initialize the search/filter query
  const searchQuery = await getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
  });

  const data = await getPrivateCloudProjectsResult({ searchQuery });
  return data;
}
