import { PublicCloudRequest } from '@prisma/client';
import PublicHistorySubItem from '@/components/history/PublicHistorySubItem';

export default function PublicHistoryItem(request: Omit<PublicCloudRequest, 'provisionedDate'>) {
  return [
    request.decisionDate && (
      <PublicHistorySubItem
        key={request.id}
        id={request.id}
        comment={request.decisionComment || ''}
        data={request.decisionDate}
        type={request.type}
        status={request.decisionStatus}
        isDecision={true}
        email={request.decisionMakerEmail}
      />
    ),
    <PublicHistorySubItem
      key={request.decisionDataId}
      id={request.decisionDataId}
      comment={request.requestComment || ''}
      data={request.createdAt}
      type={request.type}
      status={request.decisionStatus}
      isDecision={false}
      email={request.createdByEmail}
    />,
  ];
}
