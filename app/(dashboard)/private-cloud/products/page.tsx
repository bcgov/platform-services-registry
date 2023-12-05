import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyNew';
import { privateCloudProjectsPaginated, Data } from '@/queries/paginated/private-cloud';
import { privateCloudProjects } from '@/queries/private-cloud';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';

const headers = [
  { field: 'name', headerName: 'Name' },
  { field: 'ministry', headerName: 'Ministry' },
  { field: 'cluster', headerName: 'Cluster' },
  { field: 'projectOwner', headerName: 'Project Owner' },
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
    page: string;
    pageSize: string;
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

  const { data, total }: { data: Data[]; total: number } = await privateCloudProjectsPaginated(
    +pageSize || defaultPageSize,
    currentPage,
    search,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
  );

  const allProjects = await privateCloudProjects(search, ministry, cluster, userEmail, ministryRoles);

  const projectsWithActiveRequest = allProjects.filter((project: any) => project.activeRequest.length > 0);
  const projectsWithoutActiveRequest = data.filter((project) => project.activeRequest.length === 0);

  const rowsWithActiveRequest = projectsWithActiveRequest.map(privateCloudProjectDataToRow);
  const rowsWithoutActiveRequest = projectsWithoutActiveRequest.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          {(page === '1' || page === undefined) && (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-2">
                <h1 className="text-lg">Products with Active Requests</h1>
                <p className="text-sm text-gray-400 mt-1">An administrator is currently reviewing these requests</p>
              </div>
              <NewTableBody headers={headers} rows={rowsWithActiveRequest} />
            </div>
          )}
          <div className="px-4 py-4 sm:px-6 lg:px-8 text-lg font-bcsans mb-2">
            <h1>All Products</h1>
            <p className="text-sm text-gray-400 mt-1">Select a product to make an edit request</p>
          </div>
          <NewTableBody headers={headers} rows={rowsWithoutActiveRequest} />
        </div>
      }
      total={total}
      currentPage={currentPage}
      pageSize={+pageSize || defaultPageSize}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
