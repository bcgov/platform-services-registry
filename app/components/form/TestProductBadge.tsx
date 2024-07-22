import { Tooltip, Badge } from '@mantine/core';
import classNames from 'classnames';
import { differenceInDays } from 'date-fns/differenceInDays';

export default function TestProductBadge({
  data,
  className,
}: {
  data?: {
    createdAt: Date;
  };
  className?: string;
}) {
  if (!data) return null;
  const diffInDays = 30 - differenceInDays(new Date(), new Date(data.createdAt));
  const label = `${Math.abs(diffInDays)} ${
    diffInDays > 0 ? 'days until product deletion' : 'days overdue for automatic deletion'
  }`;

  return (
    <Tooltip label={label} position="top" offset={10}>
      <Badge autoContrast size="md" color="yellow" radius="sm" className={classNames('mt-1', className)}>
        Temp
      </Badge>
    </Tooltip>
  );
}
