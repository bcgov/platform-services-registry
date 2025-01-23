'use client';

import { IconWebhook } from '@tabler/icons-react';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormWebhooks from '@/components/private-cloud/sections/FormWebhooks';
import { cn } from '@/utils/js';

export default function SiloAccordion({
  disabled,
  licencePlate,
  className,
}: {
  disabled: boolean;
  licencePlate: string;
  className?: string;
}) {
  const accordionItems = [
    {
      LeftIcon: IconWebhook,
      label: 'Webhooks',
      description: '',
      Component: FormWebhooks,
      componentArgs: {
        disabled,
        licencePlate,
      },
    },
  ];

  return (
    <div className={cn(className)}>
      <PageAccordion items={accordionItems} showToggles={false} initialSelected={[]} />
    </div>
  );
}
