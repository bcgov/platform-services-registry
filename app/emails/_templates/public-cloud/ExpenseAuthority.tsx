import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

export default function ExpenseAuthority({ product }: EmailProp) {
  if (!product) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
  } = product;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg">New Expense Authority</Heading>
      <Text>Hi, {expenseAuthority?.firstName},</Text>
      <Text>You are now the Expense Authority for the the product {name} on the Public Cloud.</Text>

      <Hr className="my-4" />

      <ProductDetails
        name={name}
        description={description}
        ministry={ministry}
        po={projectOwner}
        tl1={primaryTechnicalLead}
        tl2={secondaryTechnicalLead}
        expenseAuthority={expenseAuthority}
        licencePlate={licencePlate}
      />
    </PublicCloudLayout>
  );
}
