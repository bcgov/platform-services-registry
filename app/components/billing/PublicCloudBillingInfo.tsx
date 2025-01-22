'use client';

import { Alert, Button } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { openPublicCloudMouReviewModal } from '@/components/modal/publicCloudMouReview';
import { openPublicCloudMouSignModal } from '@/components/modal/publicCloudMouSign';
import { formatFullName } from '@/helpers/user';
import { cn } from '@/utils/js';
import PublicCloudBillingDownloadButton from './PublicCloudBillingDownloadButton';
import { Product } from './types';

export default function PublicCloudBillingInfo({
  product,
  className,
}: {
  product: Product & {
    _permissions?: {
      signMou: boolean;
      reviewMou: boolean;
      downloadMou: boolean;
    };
  };
  className?: string;
}) {
  const { data: session } = useSession();
  const { licencePlate, billing } = product;

  let content = null;
  if (billing.approved) {
    content = (
      <>
        <li className="font-bold">Sign-Off complete</li>
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
    <Alert variant="light" color="blue" title="Billing eMOU status" icon={<IconInfoCircle />} className={cn(className)}>
      <ul className="list-disc text-sm">{content}</ul>
      {(session?.permissions.downloadBillingMou || product._permissions?.downloadMou) && billing.approved && (
        <PublicCloudBillingDownloadButton product={product} />
      )}
      {product._permissions?.signMou && (
        <Button
          color="primary"
          size="xs"
          className="mt-2"
          onClick={async () => {
            const res = await openPublicCloudMouSignModal<{ confirmed: boolean }>({
              licencePlate: product.licencePlate,
              name: product.name,
              provider: product.provider,
            });

            if (res.state.confirmed) {
              location.reload();
            }
          }}
        >
          Sign eMOU
        </Button>
      )}
      {product._permissions?.reviewMou && (
        <Button
          color="primary"
          size="xs"
          className="mt-2"
          onClick={async () => {
            const res = await openPublicCloudMouReviewModal<{ confirmed: boolean }>({
              licencePlate: product.licencePlate,
              billingId: product.billingId,
            });

            if (res.state.confirmed) {
              location.reload();
            }
          }}
        >
          Review eMOU
        </Button>
      )}
    </Alert>
  );
}
