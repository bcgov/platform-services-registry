import { Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { PrivateCloudRequestGetPayload } from '@/queries/private-cloud-requests';
import { PublicCloudRequestGetPayload } from '@/queries/public-cloud-requests';

export default function RequestBadge({
  request,
  isTest,
  className,
}: {
  request: PrivateCloudRequestGetPayload | PublicCloudRequestGetPayload;
  isTest?: boolean;
  className?: string;
}) {
  if (!request || !request.licencePlate) return null;

  let typeColor = 'gray';

  switch (request.type) {
    case $Enums.RequestType.CREATE:
      typeColor = 'green';
      break;
    case $Enums.RequestType.EDIT:
      typeColor = 'blue';
      break;
    case $Enums.RequestType.DELETE:
      typeColor = 'red';
      break;
  }

  let decisionColor = 'gray';

  switch (request.decisionStatus) {
    case $Enums.DecisionStatus.PENDING:
      decisionColor = 'gray';
      break;
    case $Enums.DecisionStatus.APPROVED:
      decisionColor = 'green';
      break;
    case $Enums.DecisionStatus.REJECTED:
      decisionColor = 'red';
      break;
    case $Enums.DecisionStatus.PROVISIONED:
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
        <Badge color="blue" radius="sm" className="ml-1">
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
