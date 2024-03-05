import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectsPaginated, privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';
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
    page: string;
    pageSize: string;
    ministry: string;
    cluster: string;
    active: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page, pageSize, ministry, cluster, active } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const effectivePageSize = +pageSize || defaultPageSize;

  const { data, total }: { data: any; total: number } = await privateCloudProjectsPaginated(
    effectivePageSize,
    (currentPage - 1) * effectivePageSize,
    search,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
    active !== 'false',
  );

  const projects = data.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={<TableBody rows={projects} />}
      total={total}
      currentPage={currentPage}
      pageSize={effectivePageSize}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
