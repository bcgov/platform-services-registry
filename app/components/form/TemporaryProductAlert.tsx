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
  let label = null;
  if (data?.createdAt) {
    const diffInDays = 30 - differenceInDays(new Date(), new Date(data.createdAt));
    label = (
      <>
        <span className="text-red-600/100 font-black text-lg">{Math.abs(diffInDays)}</span>
        {diffInDays > 0 ? ' days until product deletion' : ' days overdue for automatic deletion'}
      </>
    );
  } else {
    label = 'This product has not been set up yet';
  }

  return (
    <Alert
      variant="outline"
      color="red"
      title="Temporary product"
      icon={<IconExclamationCircle className="" />}
      className="mt-1"
    >
      {label}
    </Alert>
  );
}
