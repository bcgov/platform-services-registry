'use client';

import { IconWebhook } from '@tabler/icons-react';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import Webhooks from '@/components/private-cloud/sections/Webhooks';
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
      Component: Webhooks,
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
