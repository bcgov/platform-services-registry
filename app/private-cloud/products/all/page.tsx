import { z } from 'zod';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import createServerPage from '@/core/server-page';
import { Session } from 'next-auth';

const queryParamSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  ministry: z.string().optional(),
  cluster: z.string().optional(),
  active: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const privateCloudProducts = createServerPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/private-cloud/products',
  validations: { queryParams: queryParamSchema },
});
export default privateCloudProducts(async ({ pathParams, queryParams, session }) => {
  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster, active, sortKey, sortOrder } = queryParams;

  const { page, skip, take } = parsePaginationParams(pageStr ?? '', pageSizeStr ?? '', 10);

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session: session as Session,
    skip,
    take,
    ministry,
    cluster,
    active: active !== 'false',
    search,
    sortKey,
    sortOrder,
  });

  const projects = docs.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={<TableBody rows={projects} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
});
