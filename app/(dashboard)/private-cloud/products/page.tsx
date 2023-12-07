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

  // console.log('SEARCH', search);

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
    undefined,
    userEmail,
    ministryRoles,
    true,
  );

  // console.log('Create Requests Data length', requestsData.length);
  console.log('Create Requests Total', requestsTotal);
  // console.log('Search', search);
  // requestsData.forEach((project) => console.log(project));

  // console.log('requestsTotal', requestsTotal);

  const transformActiveRequests = requestsData.map((request) => ({
    ...request.requestedProject,
    created: request.created,
    activeRequest: [request],
  }));

  // console.log('transformCreateRequests', transformCreateRequests);

  const activeRequests = transformActiveRequests.map(privateCloudProjectDataToRow);

  const projectsPageSize = Math.max(effectivePageSize - activeRequests.length, 0);
  const projectsCurrentPage = Math.max(currentPage - Math.ceil(requestsTotal / effectivePageSize), 1);

  console.log('projectsPageSize', projectsPageSize);

  // NOTE: 0 is interpreted as no limit. So if projectsPageSize is 0, we want to skip the query altogether

  const { data, total }: { data: Data[]; total: number } = await privateCloudProjectsPaginated(
    0,
    projectsCurrentPage,
    search,
    ministry,
    cluster,
    userEmail,
    true,
    ministryRoles,
  );

  console.log('');
  console.log('SEARCH', search);
  console.log('Projects Page Size', projectsPageSize);
  console.log('Projects Current Page', projectsCurrentPage);

  console.log('Total', total);
  console.log('requestsTotal', requestsTotal);
  console.log('current page', currentPage);

  console.log('Table total', total + requestsTotal);
  console.log('');

  // data.forEach((project) => console.log(project));

  const projects = projectsPageSize === 0 ? [] : data.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          {activeRequests.length > 0 ? (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-0 mt-5 text-gray-700">
                <h1 className="text-lg">Products with Active Requests</h1>
                <p className="text-sm text-gray-400 mt-1">An administrator is currently reviewing these requests</p>
              </div>
              <NewTableBody rows={activeRequests} />
            </div>
          ) : null}
          {projects.length > 0 ? (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 text-lg font-bcsans mb-0 mt-5 text-gray-700">
                <h1>Products</h1>
                <p className="text-sm text-gray-400 mt-1">Select a product to make an edit request</p>
              </div>
              <NewTableBody rows={projects} />
            </div>
          ) : null}
        </div>
      }
      total={total + requestsTotal}
      currentPage={currentPage}
      pageSize={effectivePageSize}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
