import { z } from 'zod';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';
import createServerPage from '@/core/server-page';
import { Session } from 'next-auth';

const queryParamSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  ministry: z.string().optional(),
  provider: z.string().optional(),
  active: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const publicCloudProducts = createServerPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/public-cloud/products',
  validations: { queryParams: queryParamSchema },
});
export default publicCloudProducts(async ({ pathParams, queryParams, session }) => {
  const { search, page: pageStr, pageSize: pageSizeStr, ministry, provider, active, sortKey, sortOrder } = queryParams;

  const { page, skip, take } = parsePaginationParams(pageStr ?? '', pageSizeStr ?? '', 10);

  const { docs, totalCount } = await searchPublicCloudProducts({
    session: session as Session,
    skip,
    take,
    ministry,
    provider,
    active: active !== 'false',
    search,
    sortKey,
    sortOrder,
  });

  const projects = docs.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud Landing Zones"
      description="These are your products using the Public Cloud Landing Zones"
      tableBody={<TableBody rows={projects} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      showDownloadButton
      apiContext="public-cloud"
    />
  );
});
