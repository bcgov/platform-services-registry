'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPublicProducts from '@/components/table/TableBodyPublicProducts';
import { publicCloudProductSorts, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { processPublicCloudProductData } from '@/helpers/row-mapper';
import { searchPublicCloudProducts, downloadPublicCloudProducts } from '@/services/backend/public-cloud/products';
import { PublicCloudProductSimpleDecorated } from '@/types/public-cloud';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const publicCloudProducts = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/home',
});
export default publicCloudProducts(() => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['products', snap],
    queryFn: () => searchPublicCloudProducts(snap),
    refetchInterval: 2000,
  });

  let products: PublicCloudProductSimpleDecorated[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(processPublicCloudProductData);
    totalCount = data.totalCount;
  }

  return (
    <>
      <Table
        title="Products in Public Cloud Landing Zones"
        description="These products are hosted on the Public Cloud Landing Zones."
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
          const result = await downloadPublicCloudProducts(snap);
          return result;
        }}
        onSort={(sortValue) => {
          pageState.page = 1;
          pageState.sortValue = sortValue;
        }}
        sortOptions={publicCloudProductSorts.map((v) => v.label)}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBodyPublicProducts rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
