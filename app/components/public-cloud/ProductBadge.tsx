import { Badge } from '@mantine/core';
import { ProjectStatus } from '@prisma/client';
import { PublicCloudProduct } from '@prisma/client';
import LicencePlateBadge from '@/components/shared/LicencePlateBadge';
import { cn } from '@/utils/js';

export default function ProductBadge({
  data,
  className,
}: {
  data: Pick<PublicCloudProduct, 'licencePlate' | 'provider' | 'status'>;
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

  const statusBadge = (
    <Badge color={color} radius="sm" className="ml-1">
      {status}
    </Badge>
  );

  return (
    <div className={cn('inline-block', className)}>
      <LicencePlateBadge licencePlate={data.licencePlate} />
      {statusBadge}
    </div>
  );
}
