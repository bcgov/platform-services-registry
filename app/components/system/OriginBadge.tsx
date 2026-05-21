'use client';

import { Badge } from '@mantine/core';
import { EntityOriginKind } from '@/prisma/client';

const originColorMap: Record<EntityOriginKind, string> = {
  MANUAL: 'gray',
  BOOTSTRAPPED_FROM_PUBLIC_CLOUD_PRODUCT: 'blue',
  BOOTSTRAPPED_FROM_PRIVATE_CLOUD_PRODUCT: 'cyan',
  CONSOLIDATED_FROM_SYSTEM_CLUSTER: 'orange',
  CONSOLIDATED_FROM_TEAM_CLUSTER: 'grape',
  IMPORTED_OTHER: 'teal',
};

export default function OriginBadge({ originKind, label }: { originKind: EntityOriginKind; label: string }) {
  return (
    <Badge color={originColorMap[originKind] ?? 'gray'} variant="light">
      {label}
    </Badge>
  );
}
