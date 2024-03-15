import Table from '@/components/table/Table';
import NewTableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { redirect } from 'next/navigation';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';
import prisma from '@/core/prisma';

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
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const activeRequests = await prisma.privateCloudRequest.findMany({
    where: { active: true },
    select: { licencePlate: true },
    session: session as never,
  });

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    skip,
    take,
    ministry,
    cluster,
    active: true,
    search,
    extraFilter: { licencePlate: { in: activeRequests.map((req) => req.licencePlate) } },
  });

  const projects = docs.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="Products with pending requests currently under admin review."
      tableBody={<NewTableBody rows={projects} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      apiContext="private-cloud"
    />
  );
}
