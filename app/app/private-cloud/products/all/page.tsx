'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateProducts from '@/components/table/TableBodyPrivateProducts';
import { privateCloudProductSorts, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { processPrivateCloudProductData } from '@/helpers/row-mapper';
import { searchPrivateCloudProducts, downloadPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import { PrivateCloudProductSimpleDecorated } from '@/types/private-cloud';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const privateCloudProducts = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/home',
});
export default privateCloudProducts(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['products', snap],
    queryFn: () => searchPrivateCloudProducts(snap),
  });

  let products: PrivateCloudProductSimpleDecorated[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(processPrivateCloudProductData);
    totalCount = data.totalCount;
  }

  return (
    <>
      <Table
        title="Products in Private Cloud OpenShift Platform"
        description="These products are hosted on the Private Cloud OpenShift platform."
        totalCount={totalCount}
        page={snap.page ?? 1}
        pageSize={snap.pageSize ?? 10}
        search={snap.search}
        sortKey={snap.sortValue}
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
        onSort={(sortValue) => {
          pageState.page = 1;
          pageState.sortValue = sortValue;
        }}
        sortOptions={privateCloudProductSorts.map((v) => v.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBodyPrivateProducts rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
