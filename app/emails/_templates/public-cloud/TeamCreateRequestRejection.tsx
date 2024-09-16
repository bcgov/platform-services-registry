import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import ProductDetails from '../../_components/ProductDetails';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function TeamCreateRequestRejection({ request }: EmailProp) {
  if (!request) return <></>;

  const { name } = request.decisionData;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        Your request for the product {name} on the Public Cloud Landing Zone has been rejected due to the following
        reason(s):
      </Text>

      {request.decisionComment && <Text className="italic font-bold">{request.decisionComment}</Text>}

      <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
