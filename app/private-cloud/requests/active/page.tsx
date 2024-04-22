import { z } from 'zod';
import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchActivePrivateCloudRequests } from '@/queries/private-cloud-requests';
import createServerPage from '@/core/server-page';
import { Session } from 'next-auth';

const queryParamSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  ministry: z.string().optional(),
  cluster: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const privateCloudActiveRequests = createServerPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/private-cloud/products',
  validations: { queryParams: queryParamSchema },
});
export default privateCloudActiveRequests(async ({ pathParams, queryParams, session }) => {
  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster, sortKey, sortOrder } = queryParams;

  const { page, skip, take } = parsePaginationParams(pageStr ?? '', pageSizeStr ?? '', 10);

  const { docs, totalCount } = await searchActivePrivateCloudRequests({
    session: session as Session,
    skip,
    take,
    ministry,
    cluster,
    search,
    sortKey,
    sortOrder,
  });

  const transformActiveRequests = docs.map((request) => ({
    ...request.userRequestedProject,
    created: request.created,
    updatedAt: request.updatedAt,
    requests: [request],
    id: request.id,
  }));

  const activeRequests = transformActiveRequests.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      tableBody={<NewTableBody rows={activeRequests} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      apiContext="private-cloud"
    />
  );
});
