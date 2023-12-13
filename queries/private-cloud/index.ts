import { getPrivateCloudProjectsQuery, getPrivateCloudProjectsResult } from '@/queries/paginated/private-cloud/helpers';

export async function privateCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | string[] | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for their user
  ministryRoles?: string[],
  active: boolean = true,
): Promise<any> {
  // Initialize the search/filter query
  const searchQuery = await getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
    active,
  });

  const data = await getPrivateCloudProjectsResult({ searchQuery });
  return data;
}
