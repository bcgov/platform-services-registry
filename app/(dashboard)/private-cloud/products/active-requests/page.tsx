import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: number;
    pageSize: number;
    ministry: string;
    cluster: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page, pageSize, ministry, cluster } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const effectivePageSize = +pageSize || defaultPageSize;

  const { data: requestsData, total: requestsTotal } = await privateCloudRequestsPaginated(
    effectivePageSize,
    currentPage,
    search,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
    true,
  );

  const transformActiveRequests = requestsData.map((request) => ({
    ...request.userRequestedProject,
    created: request.created,
    updatedAt: request.updatedAt,
    activeRequest: [request],
    id: request.id,
  }));

  const activeRequests = transformActiveRequests.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      tableBody={<NewTableBody rows={activeRequests} />}
      total={requestsTotal}
      currentPage={currentPage}
      pageSize={effectivePageSize}
      apiContext="private-cloud"
    />
  );
}
