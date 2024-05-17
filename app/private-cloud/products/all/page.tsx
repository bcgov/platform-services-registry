'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateProducts from '@/components/table/TableBodyPrivateProducts';
import createClientPage from '@/core/client-page';
import { processPrivateCloudProductData } from '@/helpers/row-mapper';
import { PrivateCloudProjectGetPayloadWithActiveRequest } from '@/queries/private-cloud-products';
import { searchPrivateCloudProducts, downloadPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const privateCloudProducts = createClientPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/home',
});
export default privateCloudProducts(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['products', snap],
    queryFn: () => searchPrivateCloudProducts(snap),
  });

  let products: PrivateCloudProjectGetPayloadWithActiveRequest[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(processPrivateCloudProductData);
    totalCount = data.totalCount;
  }

  return (
    <>
      <Table
        title="Products in Private Cloud OpenShift Platform"
        description="These are your products hosted on Private Cloud OpenShift platform"
        totalCount={totalCount}
        page={snap.page}
        pageSize={snap.pageSize}
        search={snap.search}
        onPagination={(page: number, pageSize: number) => {
          pageState.page = page;
          pageState.pageSize = pageSize;
        }}
        onSearch={(searchTerm: string) => {
          pageState.page = 1;
          pageState.search = searchTerm;
        }}
        onExport={async () => {
          const result = await downloadPrivateCloudProducts(snap);
          return result;
        }}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBodyPrivateProducts rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
