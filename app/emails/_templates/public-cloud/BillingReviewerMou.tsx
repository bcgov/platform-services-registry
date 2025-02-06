import { Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface Props {
  request: PublicCloudRequestDetailDecorated;
}

export default function BillingReviewerMou({ request }: Props) {
  if (!request) return <></>;

  const { licencePlate, decisionData, active } = request;
  const { name, expenseAuthority, billing } = decisionData;
  if (!billing) return <></>;

  const { accountCoding } = billing;

  const productExists = !active;
  const linkUrl = productExists
    ? `/public-cloud/products/${licencePlate}/edit`
    : `/public-cloud/requests/${request.id}/request`;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">eMOU review request</Heading>
      <Text>Hi OCIO Cloud Director,</Text>
      <Text>
        You have an <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> review request for
        the product <span className="font-bold">{name}</span> on the Public Cloud.
      </Text>

      <LinkButton href={linkUrl}>Review Request</LinkButton>

      <ProductDetails product={decisionData} />

      <div>
        <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
        <Text className="mt-0 mb-2 h-4">{accountCoding}</Text>
      </div>
    </PublicCloudLayout>
  );
}
