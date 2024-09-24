'use client';

import { Prisma } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPrivateProducts from '@/components/table/TableBodyPrivateProducts';
import { productSorts } from '@/constants';
import createClientPage from '@/core/client-page';
import { processPrivateCloudProductData } from '@/helpers/row-mapper';
import { searchPrivateCloudProducts, downloadPrivateCloudProducts } from '@/services/backend/private-cloud/products';
import { PrivateCloudProductSimpleDecorated } from '@/types/private-cloud';
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
        description="These are your products hosted on Private Cloud OpenShift platform"
        totalCount={totalCount}
        page={snap.page ?? 1}
        pageSize={snap.pageSize ?? 10}
        search={snap.search}
        sortKey={
          (productSorts.find((v) => v.sortKey === snap.sortKey && v.sortOrder === snap.sortOrder) ?? productSorts[0])
            ?.humanFriendlyName
        }
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
        onSort={(sortKey) => {
          pageState.page = 1;

          const selectedOption = productSorts.find((privateSortName) => privateSortName.humanFriendlyName === sortKey);

          if (selectedOption) {
            pageState.sortKey = selectedOption.sortKey;
            pageState.sortOrder = selectedOption.sortOrder;
          } else {
            pageState.sortKey = '';
            pageState.sortOrder = Prisma.SortOrder.desc;
          }
        }}
        sortOptions={productSorts.map((v) => ({ label: v.humanFriendlyName, value: v.humanFriendlyName }))}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBodyPrivateProducts rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
