import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function ExpenseAuthority({ request }: EmailProp) {
  if (!request) return <></>;

  const { name, expenseAuthority } = request.decisionData;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">New Expense Authority</Heading>
      <Text>Hi, {expenseAuthority?.firstName},</Text>
      <Text>You are now the Expense Authority for the the product {name} on the Public Cloud.</Text>

      <LinkButton href={`/public-cloud/products/${request.decisionData.licencePlate}/edit`}>Review Product</LinkButton>

      <ProductDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
