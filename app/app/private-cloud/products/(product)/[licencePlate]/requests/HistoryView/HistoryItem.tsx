import { PrivateCloudRequest } from '@/prisma/client';
import HistorySubItem from './HistorySubItem';

export default function HistoryItem(request: Omit<PrivateCloudRequest, 'provisionedDate' | 'changes'>) {
  return [
    request.decisionDate && (
      <HistorySubItem
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
    <HistorySubItem
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
