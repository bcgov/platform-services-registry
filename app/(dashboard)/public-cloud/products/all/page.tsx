import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectsPaginated } from '@/queries/paginated/public-cloud';
import { PublicProject } from '@/queries/types';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
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
    provider: string;
    active: string;
  };
}) {
  // Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const { search, page, pageSize, ministry, provider, active } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const effectivePageSize = +pageSize || defaultPageSize;

  const { data, total }: { data: PublicProject[]; total: number } = await publicCloudProjectsPaginated(
    effectivePageSize,
    (currentPage - 1) * effectivePageSize,
    search,
    ministry,
    provider,
    userEmail,
    ministryRoles,
    active === 'true',
  );

  const rows = data.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud Landing Zones"
      description="These are your products using the Public Cloud Landing Zones"
      tableBody={<TableBody rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={effectivePageSize}
      showDownloadButton
      apiContext="public-cloud"
    />
  );
}
