import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function ExpenseAuthority({ request }: EmailProp) {
  if (!request) return <></>;

  const decisionData = request.decisionData;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
  } = decisionData;

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
