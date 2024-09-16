import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  requester: string;
}

export default function TeamCreateRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={requester}>
      <Heading className="text-lg">Provisioning request received for {request.decisionData.name} on OpenShift</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        You have requested a new project set for {request.decisionData.name} on the Private Cloud OpenShift platform.
        Our administrators have been notified and will review your request.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />
    </PrivateCloudLayout>
  );
}
