'use client';

import { IconWebhook } from '@tabler/icons-react';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormWebhooks from '@/components/private-cloud/sections/FormWebhooks';
import { cn } from '@/utils/js';

interface Product {
  licencePlate: string;
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId: string | null;
}

interface Session {
  user: {
    id: string;
  };
  permissions: {
    viewPrivateProductWebhook?: boolean;
    editPrivateProductWebhook?: boolean;
  };
}

interface SiloAccordionProps {
  currentProduct: Product;
  session: Session;
  className?: string;
}

export default function SiloAccordion({ currentProduct, session, className }: SiloAccordionProps) {
  const isMyProduct = [
    currentProduct.projectOwnerId,
    currentProduct.primaryTechnicalLeadId,
    currentProduct.secondaryTechnicalLeadId ?? '',
  ].includes(session.user.id);

  const canViewWebhook = isMyProduct || session.permissions.viewPrivateProductWebhook;
  const canEditWebhook = isMyProduct || (session.permissions.editPrivateProductWebhook ?? false);

  if (!canViewWebhook) return null;

  const accordionItems = [
    {
      LeftIcon: IconWebhook,
      label: 'Webhooks',
      description: '',
      Component: FormWebhooks,
      componentArgs: {
        disabled: !canEditWebhook,
        licencePlate: currentProduct.licencePlate,
      },
    },
  ];

  if (accordionItems.length === 0) return null;

  return (
    <div className={cn(className)}>
      <PageAccordion items={accordionItems} showToggles={false} initialSelected={[]} />
    </div>
  );
}
