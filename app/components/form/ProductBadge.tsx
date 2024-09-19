import { Badge } from '@mantine/core';
import { ProjectStatus } from '@prisma/client';
import classNames from 'classnames';
import CopyableButton from '@/components/generic/button/CopyableButton';

export default function ProductBadge({
  data,
  className,
}: {
  data?: { licencePlate: string; status: ProjectStatus; isTest?: boolean };
  className?: string;
}) {
  if (!data || !data.licencePlate) return null;

  let color = 'gray';

  switch (data.status) {
    case ProjectStatus.ACTIVE:
      color = 'green';
      break;
    case ProjectStatus.INACTIVE:
      color = 'red';
      break;
  }

  const badge = (
    <Badge color={color} radius="sm" className="ml-1">
      {data.status}
    </Badge>
  );

  const badgeTest = data.isTest ? (
    <Badge color="yellow" radius="sm" className="ml-1">
      Temp
    </Badge>
  ) : null;

  return (
    <div className={classNames('inline-block', className)}>
      <CopyableButton value={data.licencePlate}>
        <Badge color="gray" radius="sm">
          {data.licencePlate}
        </Badge>
      </CopyableButton>
      {badge}
      {badgeTest}
    </div>
  );
}
