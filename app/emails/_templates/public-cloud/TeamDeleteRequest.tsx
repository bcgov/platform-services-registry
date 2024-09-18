import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  requester: string;
}

export default function TeamDeleteRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  const { name } = request.decisionData;

  return (
    <PublicCloudLayout requester={requester} showFooter>
      <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We have received your deletion request for {name}. You will receive an email once your request has been
        processed and completed.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
