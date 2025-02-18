import { Badge } from '@mantine/core';
import { ProjectStatus } from '@prisma/client';
import { PublicCloudProject } from '@prisma/client';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { cn } from '@/utils/js';

export default function ProductBadge({
  data,
  className,
}: {
  data: Pick<PublicCloudProject, 'licencePlate' | 'provider' | 'status'>;
  className?: string;
}) {
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

  const licenceBadge = (
    <CopyableButton value={data.licencePlate}>
      <Badge color="gray" radius="sm" className="cursor-pointer">
        {data.licencePlate}
      </Badge>
    </CopyableButton>
  );

  const statusBadge = (
    <Badge color={color} radius="sm" className="ml-1">
      {status}
    </Badge>
  );

  return (
    <div className={cn('inline-block', className)}>
      {licenceBadge}
      {statusBadge}
    </div>
  );
}
