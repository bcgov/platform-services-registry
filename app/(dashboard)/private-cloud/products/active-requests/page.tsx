import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchActivePrivateCloudRequests } from '@/queries/private-cloud-requests';

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: string;
    pageSize: string;
    ministry: string;
    cluster: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const { docs, totalCount } = await searchActivePrivateCloudRequests({
    session,
    skip,
    take,
    ministry,
    cluster,
    search,
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
}
