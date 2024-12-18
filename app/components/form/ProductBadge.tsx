import { Badge } from '@mantine/core';
import { ProjectStatus } from '@prisma/client';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { cn } from '@/utils/js';

export default function ProductBadge({
  data,
  className,
}: {
  data?: { licencePlate: string; status: ProjectStatus; isTest?: boolean };
  className?: string;
}) {
  if (!data || !data.licencePlate) return null;

  let color = 'gray';
  let status = '';

  switch (data.status) {
    case ProjectStatus.ACTIVE:
      color = 'green';
      status = 'active';
      break;
    case ProjectStatus.INACTIVE:
      color = 'red';
      status = 'deleted';
      break;
  }

  const badge = (
    <Badge color={color} radius="sm" className="ml-1">
      {status}
    </Badge>
  );

  const badgeTest = data.isTest ? (
    <Badge color="yellow" radius="sm" className="ml-1">
      Temp
    </Badge>
  ) : null;

  return (
    <div className={cn('inline-block', className)}>
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
