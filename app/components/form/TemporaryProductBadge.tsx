import { Tooltip, Badge } from '@mantine/core';
import classNames from 'classnames';
import { differenceInDays } from 'date-fns/differenceInDays';

export default function TemporaryProductBadge({
  data,
  className,
}: {
  data?: {
    createdAt: Date;
  };
  className?: string;
}) {
  let label = null;
  if (data?.createdAt) {
    const diffInDays = 30 - differenceInDays(new Date(), new Date(data.createdAt));
    label = `${Math.abs(diffInDays)} ${
      diffInDays > 0 ? 'days until product deletion' : 'days overdue for automatic deletion'
    }`;
  } else {
    label = 'This product has not been set up yet';
  }

  return (
    <Tooltip label={label} position="top" offset={10} hidden={!label}>
      <Badge autoContrast size="md" color="yellow" radius="sm" className={classNames('mt-1', className)}>
        Temp
      </Badge>
    </Tooltip>
  );
}
