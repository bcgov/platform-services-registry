import { Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';

export default function ProductBadge({
  data,
  className,
}: {
  data?: { licencePlate: string; status: $Enums.ProjectStatus };
  className?: string;
}) {
  if (!data || !data.licencePlate) return null;

  let color = 'gray';

  switch (data.status) {
    case $Enums.ProjectStatus.ACTIVE:
      color = 'green';
      break;
    case $Enums.ProjectStatus.INACTIVE:
      color = 'red';
      break;
  }

  const badge = (
    <Badge color={color} radius="sm" className="ml-1">
      {data.status}
    </Badge>
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
