'use client';

import { z } from 'zod';
import { getPublicCloudRequestsHistory } from '@/services/backend/public-cloud';
import { useQuery } from '@tanstack/react-query';
import PublicHistoryItem from '@/components/history/PublicHistoryItem';
import createClientPage from '@/core/client-page';

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
    queryFn: () => getPublicCloudRequestsHistory(licencePlate),
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
          requestedProjectId={request.requestedProjectId}
          userRequestedProjectId={request.userRequestedProjectId}
        />
      ))}
    </>
  );
});
