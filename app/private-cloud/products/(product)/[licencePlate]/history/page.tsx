'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import HistoryItem from '@/components/history/PrivateHistoryItem';
import createClientPage from '@/core/client-page';
import { getPriviateCloudProductRequests } from '@/services/backend/private-cloud/products';

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
    queryFn: () => getPriviateCloudProductRequests(licencePlate),
    enabled: !!licencePlate,
  });

  if (!requests) return null;

  return (
    <>
      {requests.map((request) => (
        <HistoryItem
          key={request.id}
          id={request.id}
          licencePlate={request.licencePlate}
          createdByEmail={request.createdByEmail}
          decisionMakerEmail={request.decisionMakerEmail}
          type={request.type}
          decisionStatus={request.decisionStatus}
          isQuotaChanged={request.isQuotaChanged}
          requestComment={request.requestComment}
          decisionComment={request.decisionComment}
          active={request.active}
          created={request.created}
          updatedAt={request.updatedAt}
          decisionDate={request.decisionDate}
          projectId={request.projectId}
          decisionDataId={request.decisionDataId}
          requestDataId={request.requestDataId}
          originalDataId={request.originalDataId}
        />
      ))}
    </>
  );
});
