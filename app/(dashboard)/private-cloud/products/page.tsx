import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyNew';
import { privateCloudProjectsPaginated, Data } from '@/queries/paginated/private-cloud';
import { privateCloudProjects } from '@/queries/private-cloud';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/rowMapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { userInfo } from '@/queries/user';
import prisma from '@/lib/prisma';

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

  const createRequests = await prisma.privateCloudRequest.findMany({
    where: {
      active: true,
      type: 'CREATE',
    },
    include: {
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

  const transformCreateRequests = createRequests.map((request) => ({
    ...request.requestedProject,
    projectOwnerDetails: request.requestedProject.projectOwner,
    primaryTechnicalLeadDetails: request.requestedProject.primaryTechnicalLead,
    secondaryTechnicalLeadDetails: request.requestedProject.secondaryTechnicalLead,
    created: { $date: request.created.toDateString() },
    activeRequest: [request],
  }));

  const projectsWithActiveRequest = allProjects.filter((project: any) => project.activeRequest.length > 0);
  const projectsWithoutActiveRequest = data.filter((project) => project.activeRequest.length === 0);

  const rowsWithActiveRequest = [...transformCreateRequests, ...projectsWithActiveRequest].map(
    privateCloudProjectDataToRow,
  );
  const rowsWithoutActiveRequest = projectsWithoutActiveRequest.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          {(page === '1' || page === undefined) && (
            <div>
              <div className="px-4 py-4 sm:px-6 lg:px-8 font-bcsans mb-0 mt-5">
                <h1 className="text-lg">Products with Active Requests</h1>
                <p className="text-sm text-gray-400 mt-1">An administrator is currently reviewing these requests</p>
              </div>
              <NewTableBody rows={rowsWithActiveRequest} />
            </div>
          )}
          <div className="px-4 py-4 sm:px-6 lg:px-8 text-lg font-bcsans mb-0 mt-5">
            <h1>Products</h1>
            <p className="text-sm text-gray-400 mt-1">Select a product to make an edit request</p>
          </div>
          <NewTableBody rows={rowsWithoutActiveRequest} />
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
