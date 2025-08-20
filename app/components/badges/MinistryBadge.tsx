import { Badge, Tooltip } from '@mantine/core';
import { useSnapshot } from 'valtio';
import { appState } from '@/states/global';
import { cn } from '@/utils/js';

export default function MinistryBadge({
  ministry,
  color = 'dark',
  variant = 'light',
  className,
}: {
  ministry?: string | null;
  color?: string;
  variant?: string;
  className?: string;
}) {
  const appSnapshot = useSnapshot(appState);
  if (!ministry) return null;

  const badge = (
    <Badge color={color} variant={variant} className={cn(className)}>
      {ministry}
    </Badge>
  );

  const ministryLabel = appSnapshot.info.ORGANIZATION_NAME_BY_CODE[ministry];
  if (ministryLabel) {
    return <Tooltip label={appSnapshot.info.ORGANIZATION_NAME_BY_CODE[ministry]}>{badge}</Tooltip>;
  }

  return badge;
}
