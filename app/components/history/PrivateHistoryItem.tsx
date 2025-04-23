import PrivateHistorySubItem from '@/components/history/PrivateHistorySubItem';
import { PrivateCloudRequest } from '@/prisma/client';

export default function PrivateHistoryItem(request: Omit<PrivateCloudRequest, 'provisionedDate' | 'changes'>) {
  return [
    request.decisionDate && (
      <PrivateHistorySubItem
        key={request.requestDataId}
        id={request.requestDataId}
        comment={request.decisionComment || ''}
        data={request.decisionDate}
        type={request.type}
        status={request.decisionStatus}
        isDecision={true}
        isQuotaChanged={request.isQuotaChanged}
        email={request.decisionMakerEmail}
      />
    ),
    <PrivateHistorySubItem
      key={request.id}
      id={request.id}
      comment={request.requestComment || ''}
      data={request.createdAt}
      type={request.type}
      status={request.decisionStatus}
      isDecision={false}
      isQuotaChanged={request.isQuotaChanged}
      email={request.createdByEmail}
    />,
  ];
}
