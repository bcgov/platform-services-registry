import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyNew';
import { privateCloudProjectsPaginated, Data, privateCloudRequestsPaginated } from '@/queries/paginated/private-cloud';
import { PrivateProject } from '@/queries/types';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
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
    redirect('/login?callbackUrl=/private-cloud/products');
  }

  const { search, page, pageSize, ministry, cluster } = searchParams;
  const { userEmail, ministryRoles } = userInfo(session.user.email, session.user.roles);

  // If a page is not provided, default to 1
  const currentPage = typeof searchParams.page === 'string' ? +page : 1;
  const defaultPageSize = 10;

  const effectivePageSize = +pageSize || 10;

  const { data: requestsData, total: requestsTotal } = await privateCloudRequestsPaginated(
    effectivePageSize,
    currentPage,
    search,
    ministry,
    cluster,
    'CREATE',
    userEmail,
    ministryRoles,
    true,
  );

  console.log('Create Requests Data length', requestsData.length);
  console.log('Create Requests Total', requestsTotal);
  console.log('Search', search);
  requestsData.forEach((project) => console.log(project));

  // console.log('requestsTotal', requestsTotal);

  const transformCreateRequests = requestsData.map((request) => ({
    ...request.requestedProject,
    projectOwnerDetails: request.projectOwner,
    primaryTechnicalLeadDetails: request.primaryTechnicalLead,
    secondaryTechnicalLeadDetails: request.secondaryTechnicalLead,
    created: request.created,
    activeRequest: [request],
  }));

  const createRequests = transformCreateRequests.map(privateCloudProjectDataToRow);

  const projectsPageSize = Math.max(effectivePageSize - requestsData.length, 0);
  const projectsCurrentPage = Math.max(currentPage - Math.ceil(requestsTotal / effectivePageSize), 1);

  const { data, total }: { data: Data[]; total: number } = await privateCloudProjectsPaginated(
    projectsPageSize,
    projectsCurrentPage,
    search,
    ministry,
    cluster,
    userEmail,
    true,
    ministryRoles,
  );

  const rows = data.map(privateCloudProjectDataToRow);
  const activeRequestRows = data.filter((row) => row.activeRequest.length > 0).map(privateCloudProjectDataToRow);
  const nonActiveRequestRows = data.filter((row) => row.activeRequest.length === 0).map(privateCloudProjectDataToRow);

  const merged = [...createRequests, ...activeRequestRows];

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          {merged.length > 0 ? (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-0 mt-5 text-gray-700">
                <h1 className="text-lg">Products with Active Requests</h1>
                <p className="text-sm text-gray-400 mt-1">An administrator is currently reviewing these requests</p>
              </div>
              <NewTableBody rows={merged} />
            </div>
          ) : null}
          {nonActiveRequestRows.length > 0 ? (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 text-lg font-bcsans mb-0 mt-5 text-gray-700">
                <h1>All Products</h1>
                <p className="text-sm text-gray-400 mt-1">Select a product to make an edit request</p>
              </div>
              <NewTableBody rows={nonActiveRequestRows} />
            </div>
          ) : null}
        </div>
      }
      total={total + requestsTotal}
      currentPage={currentPage}
      pageSize={merged.length + nonActiveRequestRows.length}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
