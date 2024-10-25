'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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
export default publicCloudProductHistory(({ getPathParams }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const { licencePlate = '' } = pathParams ?? {};

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
