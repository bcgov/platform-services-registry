import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
  requester: string;
}

export default function TeamDeleteRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={requester} showFooter>
      <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We have received your deletion request for {request.decisionData.name}. You will receive an email once your
        request has been processed and completed.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />
    </PrivateCloudLayout>
  );
}
