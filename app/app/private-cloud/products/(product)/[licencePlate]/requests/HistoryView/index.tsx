'use client';

import { useQuery } from '@tanstack/react-query';
import { getPrivateCloudProductRequests } from '@/services/backend/private-cloud/products';
import HistoryItem from './HistoryItem';

export default function HistoryView({ licencePlate }: { licencePlate: string }) {
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
        <HistoryItem key={request.id} {...request} />
      ))}
    </>
  );
}
