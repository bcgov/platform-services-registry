import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchActivePublicCloudRequests } from '@/queries/public-cloud-requests';

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: string;
    pageSize: string;
    ministry: string;
    provider: string;
    sort: string;
    order: 'asc' | 'desc';
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/public-cloud/products/all');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, provider, sort, order } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const { docs, totalCount } = await searchActivePublicCloudRequests({
    session,
    skip,
    take,
    ministry,
    provider,
    search,
    sort,
    order,
  });

  const transformActiveRequests = docs.map((request) => ({
    ...request.userRequestedProject,
    created: request.created,
    updatedAt: request.updatedAt,
    requests: [request],
    id: request.id,
  }));

  const activeRequests = transformActiveRequests.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      tableBody={<NewTableBody rows={activeRequests} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      apiContext="public-cloud"
    />
  );
}
