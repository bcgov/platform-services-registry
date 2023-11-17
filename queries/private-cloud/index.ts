import { getPrivateCloudProjectsQuery, getPrivateCloudProjectsResult } from '@/queries/private-cloud/helpers';

export async function privateCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
): Promise<any> {
  // Initialize the search/filter query
  const searchQuery = getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
  });

  const data = await getPrivateCloudProjectsResult({ searchQuery });
  return data;
}
