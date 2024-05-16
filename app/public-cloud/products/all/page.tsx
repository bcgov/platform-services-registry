'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import Table from '@/components/generic/table/Table';
import TableBodyPublicProducts from '@/components/table/TableBodyPublicProducts';
import createClientPage from '@/core/client-page';
import { processPublicCloudProductData } from '@/helpers/row-mapper';
import { PublicCloudProjectGetPayloadWithActiveRequest } from '@/queries/public-cloud-products';
import { searchPublicCloudProducts, downloadPublicCloudProducts } from '@/services/backend/public-cloud/products';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const publicCloudProducts = createClientPage({
  roles: ['user'],
  fallbackUrl: '/login?callbackUrl=/public-cloud/products/all',
});
export default publicCloudProducts(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['products', snap],
    queryFn: () => searchPublicCloudProducts(snap),
  });

  let products: PublicCloudProjectGetPayloadWithActiveRequest[] = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(processPublicCloudProductData);
    totalCount = data.totalCount;
  }

  return (
    <>
      <Table
        title="Products in Public Cloud Landing Zones"
        description="These are your products using the Public Cloud Landing Zones"
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
          const result = await downloadPublicCloudProducts(snap);
          return result;
        }}
        filters={<FilterPanel />}
        isLoading={isLoading}
      >
        <TableBodyPublicProducts rows={products} isLoading={isLoading} />
      </Table>
    </>
  );
});
