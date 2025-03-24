'use client';

import { Loader } from '@mantine/core';
import { IconWebhook } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormWebhooks from '@/components/private-cloud/sections/FormWebhooks';
import { getPrivateCloudProductWebhook } from '@/services/backend/private-cloud/webhooks';
import { PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { cn } from '@/utils/js';

interface SiloAccordionProps {
  product: PrivateCloudProductDetailDecorated;
  className?: string;
}

export default function SiloAccordion({ product, className }: SiloAccordionProps) {
  const { data: webhook, isLoading: isWebhookLoading } = useQuery({
    queryKey: ['webhook', product.licencePlate],
    queryFn: () => getPrivateCloudProductWebhook(product.licencePlate),
    enabled: !!product.licencePlate,
  });

  if (isWebhookLoading) return <Loader color="pink" type="bars" />;
  if (!webhook || !webhook._permissions.view) return null;

  const accordionItems = [
    {
      LeftIcon: IconWebhook,
      label: 'Webhooks',
      description: '',
      Component: FormWebhooks,
      componentArgs: {
        disabled: !webhook._permissions.edit,
        data: webhook,
      },
    },
  ];

  return (
    <div className={cn(className)}>
      <PageAccordion items={accordionItems} showToggles={false} initialSelected={[]} />
    </div>
  );
}
