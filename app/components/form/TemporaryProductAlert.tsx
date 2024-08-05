import { Alert, Badge } from '@mantine/core';
import { IconArrowBack, IconInfoCircle, IconFile, IconExclamationCircle } from '@tabler/icons-react';
import { differenceInDays } from 'date-fns/differenceInDays';

export default function TemporaryProductAlert({
  data,
  className,
}: {
  data?: {
    createdAt?: Date;
  };
  className?: string;
}) {
  if (!data || !data.createdAt) return null;
  const diffInDays = 30 - differenceInDays(new Date(), new Date(data.createdAt));

  return (
    <Alert variant="outline" color="red" title="" icon={<IconExclamationCircle className="pt-1" />} className="mt-1">
      <span className="text-red-600/100 font-black text-lg">{Math.abs(diffInDays)}</span>
      {diffInDays > 0 ? ' days until product deletion' : ' days overdue for automatic deletion'}
    </Alert>
  );
}
