import { Badge } from '@mantine/core';
import LicencePlateBadge from '@/components/shared/LicencePlateBadge';
import { ProjectStatus } from '@/prisma/types';
import { PrivateCloudProduct } from '@/prisma/types';
import { cn } from '@/utils/js';
import ClusterBadge from './ClusterBadge';

export default function ProductBadge({
  data,
  className,
}: {
  data: Pick<PrivateCloudProduct, 'licencePlate' | 'cluster' | 'status' | 'isTest'>;
  className?: string;
}) {
  let statusColor = 'gray';
  let status = '';

  switch (data.status) {
    case ProjectStatus.ACTIVE:
      statusColor = 'green';
      status = 'active';
      break;
    case ProjectStatus.INACTIVE:
      statusColor = 'red';
      status = 'deleted';
      break;
  }

  const statusBadge = (
    <Badge color={statusColor} radius="sm" className="ml-1">
      {status}
    </Badge>
  );

  const temporaryBadge = data.isTest ? (
    <Badge color="yellow" radius="sm" className="ml-1">
      Temp
    </Badge>
  ) : null;

  return (
    <div className={cn('inline-block', className)}>
      <LicencePlateBadge licencePlate={data.licencePlate} />
      <ClusterBadge cluster={data.cluster} />
      {statusBadge}
      {temporaryBadge}
    </div>
  );
}
