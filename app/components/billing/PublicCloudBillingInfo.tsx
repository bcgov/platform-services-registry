'use client';

import { Alert, Button } from '@mantine/core';
import { IconInfoCircle, IconInfoSquareRounded, IconSquareCheck, IconSquare } from '@tabler/icons-react';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { formatFullName } from '@/helpers/user';
import PublicCloudBillingDownloadButton from './PublicCloudBillingDownloadButton';
import { Product } from './types';

export default function PublicCloudBillingInfo({ product, className }: { product: Product; className?: string }) {
  const { data: session } = useSession();
  const { licencePlate, billing } = product;

  let content = null;
  if (billing.approved) {
    content = (
      <>
        <li className="font-bold">Sign-Off Complete</li>
        {licencePlate !== billing.licencePlate && (
          <li>
            - Exempted from the eMOU approval process for the product with licence plate{' '}
            <span className="font-bold">{billing.licencePlate}</span>.
          </li>
        )}
      </>
    );
  } else if (billing.signed) {
    content = (
      <>
        <li>
          <span className="font-bold mr-1">Current Step:</span>Sign-off by the OCIO Cloud Director
        </li>
      </>
    );
  } else {
    content = (
      <>
        <li>
          <span className="font-bold mr-1">Current Step:</span>Pending sign-off from the Ministry Expense Authority (
          {formatFullName(billing.expenseAuthority)})
        </li>
        <li>
          <span className="font-bold mr-1">Next Step:</span>Sign-off by the OCIO Cloud Director
        </li>
      </>
    );
  }

  return (
    <Alert
      variant="light"
      color="blue"
      title="Billing eMOU status"
      icon={<IconInfoCircle />}
      className={classNames(className)}
    >
      <ul className="list-disc text-sm">{content}</ul>
      {session?.permissions.downloadBillingMou && billing.approved && (
        <PublicCloudBillingDownloadButton product={product} />
      )}
    </Alert>
  );
}
