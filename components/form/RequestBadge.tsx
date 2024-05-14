import { Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';

export default function RequestBadge({
  data,
  className,
}: {
  data?: { licencePlate: string; type: $Enums.RequestType; active: boolean };
  className?: string;
}) {
  if (!data || !data.licencePlate) return null;

  let color = 'gray';

  switch (data.type) {
    case $Enums.RequestType.CREATE:
      color = 'green';
      break;
    case $Enums.RequestType.EDIT:
      color = 'blue';
      break;
    case $Enums.RequestType.DELETE:
      color = 'red';
      break;
  }

  const badge = (
    <>
      <Badge color={color} radius="sm" className="ml-1">
        {data.type}
      </Badge>
      <Badge color={data.active ? 'lime' : 'pink'} radius="sm" className="ml-1">
        {data.active ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    </>
  );

  return (
    <div className={classNames('inline-block', className)}>
      <CopyableButton value={data.licencePlate}>
        <Badge color="gray" radius="sm">
          {data.licencePlate}
        </Badge>
      </CopyableButton>
      {badge}
    </div>
  );
}
