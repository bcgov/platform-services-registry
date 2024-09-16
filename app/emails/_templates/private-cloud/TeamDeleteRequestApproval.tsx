import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function TeamDeleteRequestApproval({ request }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Success! Your delete request was approved!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        We are pleased to inform you that your product {request.decisionData.name} has been approved for deletion on the
        Private Cloud OpenShift platform. Please allow 3-5 minutes for the request to be processed. If it takes longer,
        don&apos;t hesitate to reach out to us. You can log in to{' '}
        <Link className="mt-0 h-4" href={`https://console.apps.${request.decisionData.cluster}.devops.gov.bc.ca/`}>
          OpenShift cluster console{' '}
        </Link>{' '}
        to confirm that your product has been deleted.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Platform Services team in the
        Rocket.Chat channel{' '}
        <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
          #devops-operations
        </Link>
        .
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment decisionComment={request.decisionComment} />

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
