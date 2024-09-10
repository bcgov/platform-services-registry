'use client';

import { Alert, Button } from '@mantine/core';
import { Provider } from '@prisma/client';
import { useState } from 'react';
import { downloadBilling } from '@/services/backend/billing';
import { Product } from './types';

export default function BillingDownloadButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      loading={loading}
      color="primary"
      size="xs"
      className="mt-2"
      onClick={async () => {
        setLoading(true);
        await downloadBilling(
          product.billing.accountCoding,
          product.provider,
          product.licencePlate,
          `OCIO and ${product.provider === Provider.AWS ? 'AWS' : 'Microsoft Azure'} MOU.pdf`,
        );
        setLoading(false);
      }}
    >
      Download
    </Button>
  );
}
