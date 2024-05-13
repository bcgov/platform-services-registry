'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import PublicHistoryItem from '@/components/history/PublicHistoryItem';
import createClientPage from '@/core/client-page';
import { getPublicCloudProductRequests } from '@/services/backend/public-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductHistory = createClientPage({
  roles: ['user'],
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
        <PublicHistoryItem
          key={request.id}
          id={request.id}
          licencePlate={request.licencePlate}
          createdByEmail={request.createdByEmail}
          decisionMakerEmail={request.decisionMakerEmail}
          type={request.type}
          decisionStatus={request.decisionStatus}
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
