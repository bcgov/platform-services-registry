import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import { publicCloudProjectsPaginated } from '@/queries/paginated/public-cloud';
import { PublicProject } from '@/queries/types';
import { publicCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';

const headers = [
  { field: 'name', headerName: 'Name' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'provider', headerName: 'Provider' },
  { field: 'projectOwner', headerName: 'Product Owner' },
  { field: 'primaryTechnicalLead', headerName: 'Technical Leads' },
  { field: 'secondaryTechnicalLead', headerName: '' },
  { field: 'created', headerName: 'Created' },
  { field: 'licencePlate', headerName: 'Licence Plate' },
  { field: 'edit', headerName: '' },
];

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: number;
    pageSize: number;
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
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.user.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const { data, total }: { data: PublicProject[]; total: number } = await publicCloudProjectsPaginated(
    +pageSize || defaultPageSize,
    currentPage,
    search,
    ministry,
    provider,
    userEmail,
    ministryRoles,
    active,
  );

  const rows = data.map(publicCloudProjectDataToRow);

  return (
    <Table
      title="Products in Public Cloud Landing Zones"
      description="These are your products using the Public Cloud Landing Zones"
      tableBody={<TableBody headers={headers} rows={rows} />}
      total={total}
      currentPage={currentPage}
      pageSize={pageSize || defaultPageSize}
      showDownloadButton
    />
  );
}
