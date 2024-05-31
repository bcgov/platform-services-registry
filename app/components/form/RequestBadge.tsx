import { Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';

interface DecisionData {
  isTest?: boolean;
}

export default function RequestBadge({
  data,
  className,
}: {
  data?: {
    licencePlate: string;
    type: $Enums.RequestType;
    active: boolean;
    decisionStatus: $Enums.DecisionStatus;
    decisionData?: DecisionData;
  };
  className?: string;
}) {
  if (!data || !data.licencePlate) return null;

  let typeColor = 'gray';

  switch (data.type) {
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

  switch (data.decisionStatus) {
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
        {data.type}
      </Badge>
      <Badge color={data.active ? 'lime' : 'pink'} radius="sm" className="ml-1">
        {data.active ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
      <Badge color={decisionColor} radius="sm" className="ml-1">
        {data.decisionStatus}
      </Badge>
      {data.decisionData?.isTest ? (
        <Badge color="blue" radius="sm" className="ml-1">
          Temp
        </Badge>
      ) : null}
    </>
  );

  return (
    <div className={classNames('inline-block', className)}>
      <CopyableButton value={data.licencePlate}>
        <Badge color="gray" radius="sm">
          {data.licencePlate}
        </Badge>
      </CopyableButton>
      {badges}
    </div>
  );
}
