'use client';

import { Alert, Button } from '@mantine/core';
import { IconInfoCircle, IconInfoSquareRounded, IconSquareCheck, IconSquare } from '@tabler/icons-react';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { formatFullName } from '@/helpers/user';
import { formatDate } from '@/utils/date';
import PublicCloudBillingDownloadButton from './PublicCloudBillingDownloadButton';
import { Product } from './types';

export default function PublicCloudBillingInfo({ product, className }: { product: Product; className?: string }) {
  const { data: session } = useSession();
  const { licencePlate, billing } = product;

  return (
    <Alert
      variant="light"
      color="blue"
      title="Billing eMOU status"
      icon={<IconInfoCircle />}
      className={classNames(className)}
    >
      <ul className="list-disc text-sm">
        <li>
          {billing.signed ? (
            <>
              <IconSquareCheck className="inline-block text-sm" />
              Signed by <span className="font-bold">{formatFullName(billing.signedBy)}</span> at{' '}
              <span className="font-bold">{formatDate(billing.signedAt)}</span>.
            </>
          ) : (
            <>
              <IconSquare className="inline-block text-sm" />
              Pending signature from <span className="font-bold">{formatFullName(billing.expenseAuthority)}</span>.
            </>
          )}
        </li>
        <li>
          {billing.approved ? (
            <>
              <IconSquareCheck className="inline-block text-sm" />
              Approved by <span className="font-bold">{formatFullName(billing.approvedBy)}</span> at{' '}
              <span className="font-bold">{formatDate(billing.signedAt)}</span>.
            </>
          ) : (
            <>
              <IconSquare className="inline-block text-sm" />
              Pending approval from admin.
            </>
          )}
        </li>
        {licencePlate !== billing.licencePlate && (
          <li>
            <IconInfoSquareRounded className="inline-block text-sm" />
            Exempted from the eMOU approval process for the product with licence plate{' '}
            <span className="font-bold">{billing.licencePlate}</span>.
          </li>
        )}
      </ul>
      {session?.permissions.downloadBillingMou && licencePlate === billing.licencePlate && billing.approved && (
        <PublicCloudBillingDownloadButton product={product} />
      )}
    </Alert>
  );
}
