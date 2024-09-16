import { Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudProductDetail } from '@/types/public-cloud';

interface Props {
  product: PublicCloudProductDetail;
}

export default function ExpenseAuthorityMouProduct({ product }: Props) {
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
    billing,
  } = product;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg">Expense Authority eMOU request</Heading>
      <Text>Hi {expenseAuthority?.firstName},</Text>
      <Text>
        You have an <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> signing request for
        the product <span className="font-bold">{name}</span> on the Public Cloud.
      </Text>
      <Link href={`${BASE_URL}/public-cloud/products/${licencePlate}/edit`}>
        Please click this link to access the request page.
      </Link>

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
      <div>
        <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
        <Text className="mt-0 mb-2 h-4">{accountCoding}</Text>
      </div>
    </PublicCloudLayout>
  );
}
