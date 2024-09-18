import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import Changes from '@/emails/_components/private-cloud/Changes';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  requester: string;
}

export default function AdminEditRequest({ request, requester }: EmailProp) {
  if (!request.originalData) return <></>;

  return (
    <PrivateCloudLayout requester={requester}>
      <Heading className="text-lg">New Request!</Heading>
      <Text>Hi Registry Team, </Text>
      <Text>
        There is a new request that requires your review. Log in to the Registry to review the details. If you have any
        questions about the request, the PO and TL contact details are included below and in the Registry.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>Review Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />

      <Changes request={request} />
    </PrivateCloudLayout>
  );
}
