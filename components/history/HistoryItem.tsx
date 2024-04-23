import { PrivateCloudRequest } from '@prisma/client';
import HistorySubItem from '@/components/history/HistorySubItem';

export default function HistoryItem(request: PrivateCloudRequest) {
  return [
    request.decisionDate && (
      <HistorySubItem
        key={request.userRequestedProjectId}
        id={request.userRequestedProjectId}
        comment={request.decisionComment || 'No comments'}
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
      comment={request.requestComment || 'No comments'}
      data={request.created}
      type={request.type}
      status={request.decisionStatus}
      isDecision={false}
      isQuotaChanged={request.isQuotaChanged}
      email={request.createdByEmail}
    />,
  ];
}
