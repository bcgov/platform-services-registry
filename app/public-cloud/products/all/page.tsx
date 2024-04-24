'use client';

import { proxy, useSnapshot } from 'valtio';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { publicCloudProjectDataToRow } from '@/helpers/row-mapper';
import { searchPublicCloudProducts, downloadPublicCloudProducts } from '@/services/backend/public-cloud';
import AlertBox from '@/components/modal/AlertBox';
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

  let products = [];
  let totalCount = 0;

  if (!isLoading && data) {
    products = data.docs.map(publicCloudProjectDataToRow);
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
          if (!result) pageState.showDownloadAlert = true;
        }}
        filters={<FilterPanel />}
      >
        <TableBody rows={products} isLoading={isLoading} />
      </Table>
      <AlertBox
        isOpen={snap.showDownloadAlert}
        title="Nothing to export"
        message="There is no data available for download."
        onCancel={() => (pageState.showDownloadAlert = false)}
        cancelButtonText="DISMISS"
        singleButton
      />
    </>
  );
});
