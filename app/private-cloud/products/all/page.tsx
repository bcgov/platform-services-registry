'use client';

import { proxy, useSnapshot } from 'valtio';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyProducts';
import { privateCloudProjectDataToRow } from '@/components/table/helpers/row-mapper';
import { searchPriviateCloudProducts, downloadPriviateCloudProducts } from '@/services/backend/private-cloud';
import AlertBox from '@/components/modal/AlertBox';
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
    queryFn: () => searchPriviateCloudProducts(snap),
  });

  if (isLoading || !data) {
    return null;
  }

  const products = data.docs.map(privateCloudProjectDataToRow);

  return (
    <>
      <Table
        title="Products in Private Cloud OpenShift Platform"
        description="These are your products hosted on Private Cloud OpenShift platform"
        totalCount={data.totalCount}
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
          const result = await downloadPriviateCloudProducts(snap);
          if (!result) pageState.showDownloadAlert = true;
        }}
        filters={<FilterPanel />}
      >
        <TableBody rows={products} />
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
