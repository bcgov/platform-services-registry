'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import createClientPage from '@/core/client-page';
import { privateCloudProjectDataToRow } from '@/helpers/row-mapper';
import { searchPrivateCloudProducts, downloadPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const privateCloudProducts = createClientPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/private-cloud/products/all',
});
export default privateCloudProducts(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['products', snap],
    queryFn: () => searchPrivateCloudProducts(snap),
  });

  let products = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(privateCloudProjectDataToRow);
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
        <TableBody rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
