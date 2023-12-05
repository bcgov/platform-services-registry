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

  const activeRequestsWithProjject = await prisma.privateCloudRequest.findMany({
    where: {
      active: true,
      type: {
        in: ['EDIT', 'DELETE'],
      },
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

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

  const transformActiveRequests = activeRequestsWithProjject.map((request) => ({
    ...request.project,
    projectOwnerDetails: request?.project?.projectOwner,
    primaryTechnicalLeadDetails: request?.project?.primaryTechnicalLead,
    secondaryTechnicalLeadDetails: request?.project?.secondaryTechnicalLead,
    created: { $date: request.created.toDateString() },
    activeRequest: [request],
  }));

  const rowsWithActiveRequest = [...transformCreateRequests, ...transformActiveRequests].map(
    privateCloudProjectDataToRow,
  );

  const isFirstPage = page === '1' || page === undefined;

  const { data: projectsWithoutActiveRequest, total }: { data: Data[]; total: number } =
    await privateCloudProjectsPaginated(
      isFirstPage ? (+pageSize || defaultPageSize) - rowsWithActiveRequest.length : +pageSize || defaultPageSize,
      currentPage,
      search,
      ministry,
      cluster,
      userEmail,
      ministryRoles,
      true,
    );

  const rowsWithoutActiveRequest = projectsWithoutActiveRequest.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={
        <div>
          {isFirstPage && (
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
