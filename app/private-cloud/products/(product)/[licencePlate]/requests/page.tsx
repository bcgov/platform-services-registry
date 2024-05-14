'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import { z } from 'zod';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyRequests';
import createClientPage from '@/core/client-page';
import { privateCloudProjectDataToRow } from '@/helpers/row-mapper';
import { searchPrivateCloudRequests } from '@/services/backend/private-cloud/requests';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductRequests = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
  fallbackUrl: '/login?callbackUrl=/private-cloud/products/all',
});
export default privateCloudProductRequests(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);
  const { licencePlate } = pathParams;

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPrivateCloudRequests({ ...snap, licencePlate }),
    enabled: !!licencePlate,
  });

  let requests = [];
  let totalCount = 0;

  if (!isLoading && data) {
    const transformActiveRequests = data.docs.map((request) => ({
      ...request.requestData,
      created: request.created,
      updatedAt: request.updatedAt,
      requests: [request],
      id: request.id,
    }));

    requests = transformActiveRequests.map(privateCloudProjectDataToRow);
    totalCount = data.totalCount;
  }

  return (
    <Table
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
      filters={<FilterPanel />}
      isLoading={isLoading}
    >
      <TableBody rows={requests} isLoading={isLoading} />
    </Table>
  );
});
