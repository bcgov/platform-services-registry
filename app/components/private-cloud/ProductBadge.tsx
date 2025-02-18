import { Tooltip, Badge } from '@mantine/core';
import { Cluster, ProjectStatus } from '@prisma/client';
import { PrivateCloudProject } from '@prisma/client';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { cn } from '@/utils/js';

export default function ProductBadge({
  data,
  className,
}: {
  data: Pick<PrivateCloudProject, 'licencePlate' | 'cluster' | 'status' | 'isTest'>;
  className?: string;
}) {
  let color = 'gray';
  let clusterColor = 'gray';
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

  switch (data.cluster) {
    case Cluster.SILVER:
      clusterColor = '#C0C0C0';
      break;
    case Cluster.GOLD:
      clusterColor = '#FFD700';
      break;
    case Cluster.GOLDDR:
      clusterColor = '#A38A00';
      break;
    case Cluster.EMERALD:
      clusterColor = '#50C878';
      break;
    case Cluster.KLAB:
      clusterColor = '#FF0000';
      break;
    case Cluster.KLAB2:
      clusterColor = '#036D19';
      break;
    case Cluster.CLAB:
      clusterColor = '#FFC0CB';
      break;
  }

  const licenceBadge = (
    <CopyableButton value={data.licencePlate}>
      <Badge color="gray" radius="sm" className="cursor-pointer">
        {data.licencePlate}
      </Badge>
    </CopyableButton>
  );

  const clusterBadge = (
    <Tooltip label="Navigate" position="top" offset={10}>
      <a
        href={`https://console.apps.${data.cluster.toLowerCase()}.devops.gov.bc.ca/`}
        target="_blank"
        className={cn('underline text-blue-500 hover:text-blue-700', className)}
        rel="noopener noreferrer"
      >
        <Badge color={clusterColor} autoContrast radius="sm" className="cursor-pointer ml-1">
          {data.cluster}
        </Badge>
      </a>
    </Tooltip>
  );

  const statusBadge = (
    <Badge color={color} radius="sm" className="ml-1">
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
      {licenceBadge}
      {clusterBadge}
      {statusBadge}
      {temporaryBadge}
    </div>
  );
}
