import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  requester: string;
}

export default function TeamDeleteRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={requester ?? 'System Admin'}>
      <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We have received your deletion request for {request.decisionData.name}. You will receive an email once your
        request has been processed and completed.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails
        name={request.decisionData.name}
        description={request.decisionData.description}
        ministry={request.decisionData.ministry}
        po={request.decisionData.projectOwner}
        tl1={request.decisionData.primaryTechnicalLead}
        tl2={request.decisionData.secondaryTechnicalLead}
      />

      <NamespaceDetails cluster={request.decisionData.cluster} licencePlate={request.decisionData.licencePlate} />
    </PrivateCloudLayout>
  );
}
