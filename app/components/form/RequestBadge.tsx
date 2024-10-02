import { Badge } from '@mantine/core';
import { RequestType, DecisionStatus } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export default function RequestBadge({
  request,
  isTest,
  className,
}: {
  request: Pick<PrivateCloudRequestDetail, 'licencePlate' | 'type' | 'decisionStatus' | 'active'>;
  isTest?: boolean;
  className?: string;
}) {
  if (!request || !request.licencePlate) return null;

  let typeColor = 'gray';

  switch (request.type) {
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

  let decisionColor = 'gray';

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      decisionColor = 'gray';
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

  const badges = (
    <>
      <Badge color={typeColor} radius="sm" className="ml-1">
        {request.type}
      </Badge>
      <Badge color={request.active ? 'lime' : 'pink'} radius="sm" className="ml-1">
        {request.active ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
      <Badge color={decisionColor} radius="sm" className="ml-1">
        {request.decisionStatus}
      </Badge>
      {isTest && (
        <Badge color="yellow" radius="sm" className="ml-1">
          Temp
        </Badge>
      )}
    </>
  );

  return (
    <div className={classNames('inline-block', className)}>
      <CopyableButton value={request.licencePlate}>
        <Badge color="gray" radius="sm">
          {request.licencePlate}
        </Badge>
      </CopyableButton>
      {badges}
    </div>
  );
}
