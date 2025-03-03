import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { getAccountCodingString } from '@/helpers/billing';
import { PublicCloudBillingDetailDecorated, PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface Props {
  request: PublicCloudRequestDetailDecorated;
  billing: PublicCloudBillingDetailDecorated;
}

export default function EmouServiceAgreement({ request, billing }: Props) {
  if (!request) return <></>;

  const { name } = request.decisionData;
  const { accountCoding } = billing;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">eMOU Service Agreement</Heading>
      <Text>Hi,</Text>
      <Text>
        An <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> is available for download
        for the product <span className="font-bold">{name}</span> on the Public Cloud.
      </Text>

      <ProductDetails product={request.decisionData} />

      <div>
        <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
        <Text className="mt-0 mb-2 h-4">{getAccountCodingString(accountCoding)}</Text>
      </div>
    </PublicCloudLayout>
  );
}
