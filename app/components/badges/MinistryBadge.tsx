import { Badge, Tooltip } from '@mantine/core';
import { ministryOptions } from '@/constants';
import { cn } from '@/utils/js';

const additionalMinistryOptions = [
  {
    value: 'PSFS',
    label: 'Post Secondary Education and Future Skills',
  },
  {
    value: 'MOTI',
    label: 'Transportation and Infrastructure',
  },
  {
    value: 'EHS',
    label: 'Emergency Health Services',
  },
  {
    value: 'ISMC',
    label: 'International Student Ministries Canada',
  },
];

export const ministryMap = ministryOptions
  .concat(additionalMinistryOptions)
  .reduce<{ [key: string]: string }>((ret, mini) => {
    ret[mini.value] = mini.label;
    return ret;
  }, {});

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
  if (!ministry) return null;

  const badge = (
    <Badge color={color} variant={variant} className={cn(className)}>
      {ministry}
    </Badge>
  );

  const ministryLabel = ministryMap[ministry];
  if (ministryLabel) {
    return <Tooltip label={ministryMap[ministry]}>{badge}</Tooltip>;
  }

  return badge;
}
