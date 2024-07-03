'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import PrivateHistoryItem from '@/components/history/PrivateHistoryItem';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProductRequests } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductHistory = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductHistory(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsIsError,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', licencePlate],
    queryFn: () => getPrivateCloudProductRequests(licencePlate),
    enabled: !!licencePlate,
  });

  if (!requests) return null;

  return (
    <>
      {requests.map((request) => (
        <PrivateHistoryItem key={request.id} {...request} />
      ))}
    </>
  );
});
