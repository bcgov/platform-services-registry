'use client';
import { getPriviateCloudRequestsHistory } from '@/services/backend/private-cloud';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import HistoryItem from '@/components/history/HistoryItem';

function ProductHistory() {
  const params = useParams();
  const licencePlate = params.licencePlate as string;

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsIsError,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', licencePlate],
    queryFn: () => getPriviateCloudRequestsHistory(licencePlate),
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
          requestedProjectId={request.requestedProjectId}
          userRequestedProjectId={request.userRequestedProjectId}
        />
      ))}
    </>
  );
}

export default ProductHistory;
