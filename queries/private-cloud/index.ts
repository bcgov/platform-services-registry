import { getPrivateCloudProjectsQuery, getPrivateCloudProjectsResult } from '@/queries/private-cloud/helpers';

export async function privateCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null,
): Promise<any> {
  // Initialize the search/filter query
  const searchQuery = await getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
  });

  const data = await getPrivateCloudProjectsResult({ searchQuery });
  return data;
}
