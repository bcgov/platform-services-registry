import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetailDecorated;
  requester: string;
}

export default function TeamCreateRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  const { name, provider } = request.decisionData;

  return (
    <PublicCloudLayout requester={requester} showFooter>
      <Heading className="text-lg">
        Provisioning request received for {name} on {provider}
      </Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        You have requested a new project set for {name} on the Public Cloud Landing Zone - {provider}. Our
        administrators have been notified and will review your request.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
