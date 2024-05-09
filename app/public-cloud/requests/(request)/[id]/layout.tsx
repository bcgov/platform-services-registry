'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import createClientPage from '@/core/client-page';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { publicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default publicCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPublicCloudRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (request) {
      publicProductState.currentRequest = request;
      publicProductState.licencePlate = request?.licencePlate;
    }
  }, [request]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
});
