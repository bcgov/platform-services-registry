import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: string;
    pageSize: string;
    ministry: string;
    provider: string;
    active: string;
    sortKey: string;
    sortOrder: 'asc' | 'desc';
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/public-cloud/products');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, provider, active, sortKey, sortOrder } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
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
}
