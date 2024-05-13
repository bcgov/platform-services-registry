'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { z } from 'zod';
import createClientPage from '@/core/client-page';
import { getPriviateCloudRequest } from '@/services/backend/private-cloud/requests';
import { privateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudProductSecurityACS = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductSecurityACS(({ pathParams, queryParams, session, children }) => {
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPriviateCloudRequest(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (request) {
      privateProductState.currentRequest = request;
      privateProductState.licencePlate = request?.licencePlate;
    }
  }, [request]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
});
