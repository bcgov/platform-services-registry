import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import Changes from '@/emails/_components/public-cloud/Changes';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  requester: string;
}

export default function TeamEditRequest({ request, requester }: EmailProp) {
  if (!request.originalData) return <></>;

  return (
    <PublicCloudLayout requester={requester}>
      <Heading className="text-lg text-black">Your Edit Summary!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        You have edited your product {request.originalData.name} in the Public Cloud Landing Zone with the licence plate{' '}
        {request.licencePlate}. <br />
        <br /> You can see a summary of the changes below in this email, or click the button to view them in the Product
        Registry.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />

      <Changes request={request} />
    </PublicCloudLayout>
  );
}
