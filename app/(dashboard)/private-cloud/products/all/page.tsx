import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { authOptions } from '@/core/auth-options';
import { parsePaginationParams } from '@/helpers/pagination';
import { searchPrivateCloudProducts } from '@/queries/private-cloud-products';

export default async function ProductsTable({
  searchParams,
}: {
  searchParams: {
    search: string;
    page: string;
    pageSize: string;
    ministry: string;
    cluster: string;
    active: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { search, page: pageStr, pageSize: pageSizeStr, ministry, cluster, active } = searchParams;

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    skip,
    take,
    ministry,
    cluster,
    active: active !== 'false',
    search,
  });

  const projects = docs.map(privateCloudProjectDataToRow);

  return (
    <Table
      title="Products in Private Cloud OpenShift Platform"
      description="These are your products hosted on Private Cloud OpenShift platform"
      tableBody={<TableBody rows={projects} />}
      total={totalCount}
      currentPage={page}
      pageSize={take}
      showDownloadButton
      apiContext="private-cloud"
    />
  );
}
