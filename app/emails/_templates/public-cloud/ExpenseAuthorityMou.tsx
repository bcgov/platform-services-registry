import { Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface Props {
  request: PublicCloudRequestDetailDecorated;
}

export default function ExpenseAuthorityMou({ request }: Props) {
  if (!request) return <></>;

  const { name, expenseAuthority, billing } = request.decisionData;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">Expense Authority eMOU request</Heading>
      <Text>Hi {expenseAuthority?.firstName},</Text>
      <Text>
        You have an <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> signing request for
        the product <span className="font-bold">{name}</span> on the Public Cloud.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>Review Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <div>
        <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
        <Text className="mt-0 mb-2 h-4">{accountCoding}</Text>
      </div>
    </PublicCloudLayout>
  );
}
