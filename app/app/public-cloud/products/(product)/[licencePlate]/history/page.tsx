'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import PublicHistoryItem from '@/components/history/PublicHistoryItem';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPublicCloudProductRequests } from '@/services/backend/public-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductHistory = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductHistory(({ pathParams }) => {
  const { licencePlate } = pathParams;

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsIsError,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', licencePlate],
    queryFn: () => getPublicCloudProductRequests(licencePlate),
    enabled: !!licencePlate,
  });

  if (!requests) return null;

  return (
    <>
      {requests.map((request) => (
        <PublicHistoryItem key={request.id} {...request} />
      ))}
    </>
  );
});
