import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudRequestsPaginated } from '@/queries/paginated/public-cloud';
import { PublicProject } from '@/queries/types';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
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
    provider: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page, pageSize, ministry, provider } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const effectivePageSize = +pageSize || defaultPageSize;

  const { data: requestsData, total: requestsTotal } = await publicCloudRequestsPaginated(
    effectivePageSize,
    currentPage,
    search,
    ministry,
    provider,
    userEmail,
    ministryRoles,
  );

  const transformActiveRequests = requestsData.map((request) => ({
    ...request.requestedProject,
    created: request.created,
    updatedAt: request.updatedAt,
    activeRequest: [request],
    id: request.id,
  }));

  const activeRequests = transformActiveRequests.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud Landing Zones"
      description="Products with pending requests currently under admin review."
      tableBody={<TableBody rows={activeRequests} />}
      total={requestsTotal}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
    />
  );
}
