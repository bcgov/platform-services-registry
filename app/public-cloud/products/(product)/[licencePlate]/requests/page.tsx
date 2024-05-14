'use client';

import { useQuery } from '@tanstack/react-query';
import { proxy, useSnapshot } from 'valtio';
import { z } from 'zod';
import Table from '@/components/generic/table/Table';
import TableBody from '@/components/table/TableBodyRequests';
import createClientPage from '@/core/client-page';
import { publicCloudProjectDataToRow } from '@/helpers/row-mapper';
import { searchPublicCloudRequests } from '@/services/backend/public-cloud/requests';
import FilterPanel from './FilterPanel';
import { pageState } from './state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudRequests = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
  fallbackUrl: '/login?callbackUrl=/public-cloud/products/all',
});
export default publicCloudRequests(({ pathParams, queryParams, session }) => {
  const snap = useSnapshot(pageState);
  const { licencePlate } = pathParams;

  const { data, isLoading } = useQuery({
    queryKey: ['requests', snap],
    queryFn: () => searchPublicCloudRequests({ ...snap, licencePlate }),
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

    requests = transformActiveRequests.map(publicCloudProjectDataToRow);
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
