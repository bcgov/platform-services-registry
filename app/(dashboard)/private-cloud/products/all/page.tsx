import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyNew';
import { privateCloudProjectsPaginated, privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';
import { number } from 'zod';

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
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const { search, page, pageSize, ministry, cluster } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.user.roles);

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
  );

  const projects = data.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          <NewTableBody rows={projects} />
        </div>
      }
      total={total}
      currentPage={currentPage}
      pageSize={effectivePageSize}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
