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

  const { data: requestsData, total: requestsTotal } = await privateCloudRequestsPaginated(
    effectivePageSize,
    currentPage,
    search,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
  );

  const transformActiveRequests = requestsData.map((request) => ({
    ...request.userRequestedProject,
    created: request.created,
    activeRequest: [request],
  }));

  const activeRequests = transformActiveRequests.map(privateCloudProjectDataToRow);

  const startIndex = (currentPage - 1) * effectivePageSize;
  const requestsRemaining = Math.min(Math.max(requestsTotal - startIndex, 0), effectivePageSize);
  const productsRemaining = Math.max(effectivePageSize - requestsRemaining, 0);

  const totalRowsDisplayedUntilPrevPage = (currentPage - 1) * effectivePageSize;
  const totalProductsDisplayedInPrevPages = Math.max(totalRowsDisplayedUntilPrevPage - requestsTotal, 0);
  const productsSkip = requestsRemaining === 0 ? totalProductsDisplayedInPrevPages : 0;

  const { data, total }: { data: any; total: number } = await privateCloudProjectsPaginated(
    productsRemaining,
    productsSkip,
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
          {activeRequests.length > 0 ? (
            <div>
              <div className=" bg-white px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-0 pt-4 text-gray-700 ">
                <h1 className="text-lg">Products with Active Requests</h1>
                <p className="text-sm text-gray-400 mt-1">An administrator is currently reviewing these requests</p>
              </div>
              <NewTableBody rows={activeRequests} />
            </div>
          ) : null}
          {projects.length > 0 ? (
            <div>
              <div className=" bg-white px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-0 pt-4 text-gray-700 ">
                <h1 className="text-lg">Products</h1>
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
