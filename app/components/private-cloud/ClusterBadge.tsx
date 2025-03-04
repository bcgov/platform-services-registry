import { Tooltip, Badge } from '@mantine/core';
import { Cluster } from '@prisma/client';

export default function ClusterBadge({ cluster }: { cluster: Cluster }) {
  let clusterColor = 'gray';

  switch (cluster) {
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

  const clusterBadge = (
    <Tooltip label="Navigate" position="top" offset={10}>
      <a
        href={`https://console.apps.${cluster.toLowerCase()}.devops.gov.bc.ca/`}
        target="_blank"
        className="underline text-blue-500 hover:text-blue-700"
        rel="noopener noreferrer"
      >
        <Badge color={clusterColor} autoContrast radius="sm" className="cursor-pointer ml-1">
          {cluster}
        </Badge>
      </a>
    </Tooltip>
  );

  return clusterBadge;
}
