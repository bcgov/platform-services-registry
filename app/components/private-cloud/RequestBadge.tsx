import { Badge } from '@mantine/core';
import LicencePlateBadge from '@/components/shared/LicencePlateBadge';
import { RequestType, DecisionStatus } from '@/prisma/client';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import { cn } from '@/utils/js';
import ClusterBadge from './ClusterBadge';

export default function RequestBadge({
  data,
  className,
}: {
  data: Pick<
    PrivateCloudRequestDetailDecorated,
    'licencePlate' | 'type' | 'decisionStatus' | 'decisionData' | 'active' | 'actioned'
  >;
  className?: string;
}) {
  let typeColor = 'gray';
  let decisionColor = 'gray';

  switch (data.type) {
    case RequestType.CREATE:
      typeColor = 'green';
      break;
    case RequestType.EDIT:
      typeColor = 'blue';
      break;
    case RequestType.DELETE:
      typeColor = 'red';
      break;
  }

  let status: string = data.decisionStatus;
  switch (data.decisionStatus) {
    case DecisionStatus.PENDING:
      decisionColor = 'gray';
      status = data.actioned ? 'Reviewing' : 'Submitted';
      break;
    case DecisionStatus.APPROVED:
    case DecisionStatus.AUTO_APPROVED:
      decisionColor = 'green';
      break;
    case DecisionStatus.REJECTED:
      decisionColor = 'red';
      break;
    case DecisionStatus.PROVISIONED:
      decisionColor = 'blue';
      break;
  }

  return (
    <div className={cn('inline-block', className)}>
      <LicencePlateBadge licencePlate={data.licencePlate} />
      <ClusterBadge cluster={data.decisionData.cluster} />
      <Badge color={typeColor} radius="sm" className="ml-1">
        {data.type}
      </Badge>
      <Badge color={data.active ? 'lime' : 'pink'} radius="sm" className="ml-1">
        {data.active ? 'ACTIVE' : 'CLOSED'}
      </Badge>
      <Badge color={decisionColor} radius="sm" className="ml-1">
        {status}
      </Badge>
      {data.decisionData.isTest && (
        <Badge color="yellow" radius="sm" className="ml-1">
          Temp
        </Badge>
      )}
    </div>
  );
}
