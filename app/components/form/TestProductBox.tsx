import { Tooltip, Badge } from '@mantine/core';
import { differenceInDays } from 'date-fns/differenceInDays';

export default function TestProductBox({
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

  return (
    <Tooltip
      label={`${Math.abs(diffInDays)} ${
        diffInDays > 0 ? 'days until product deletion' : 'days overdue for automatic deletion'
      }`}
      position="top"
      offset={10}
      className={className}
    >
      <Badge autoContrast size="xl" color="blue" radius="md" className="mb-1">
        Temp
      </Badge>
    </Tooltip>
  );
}
