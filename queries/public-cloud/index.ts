import { getPublicCloudProjectsQuery, getPublicCloudProjectsTotalCount } from '@/queries/public-cloud/helpers';

export async function publicCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  provider?: string | string[] | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for their user
  ministryRoles?: string[],
  active: boolean = true,
): Promise<any> {
  // Initialize the search/filter query
  const searchQuery = await getPublicCloudProjectsQuery({
    searchTerm,
    ministry,
    provider,
    userEmail,
    ministryRoles,
    active,
  });

  const data = await getPublicCloudProjectsTotalCount({ searchQuery });
  return data;
}
