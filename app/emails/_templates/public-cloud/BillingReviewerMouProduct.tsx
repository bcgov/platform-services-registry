import { Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { getAccountCodingString } from '@/helpers/billing';
import { PublicCloudBillingDetailDecorated, PublicCloudProductDetail } from '@/types/public-cloud';

interface Props {
  product: PublicCloudProductDetail;
  billing: PublicCloudBillingDetailDecorated;
}

export default function BillingReviewerMou({ product, billing }: Props) {
  if (!product) return <></>;

  const { licencePlate, name } = product;
  const { accountCoding } = billing;
  const linkUrl = `/public-cloud/products/${licencePlate}/billing`;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">eMOU review request</Heading>
      <Text>Hi CSBC Cloud Director,</Text>
      <Text>
        You have an <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> review request for
        the product <span className="font-bold">{name}</span> on the Public Cloud.
      </Text>

      <LinkButton href={linkUrl}>Review Billing</LinkButton>

      <ProductDetails product={product} />

      <div>
        <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
        <Text className="mt-0 mb-2 h-4">{getAccountCodingString(accountCoding)}</Text>
      </div>
    </PublicCloudLayout>
  );
}
