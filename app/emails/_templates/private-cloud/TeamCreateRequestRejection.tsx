import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function TeamCreateRequestRejection({ request }: EmailProp) {
  if (!request) return <></>;

  const { decisionData } = request;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        Your new product request regarding the product {decisionData.name} on the Private Cloud Openshift platform has
        been rejected due to the following reason(s):
      </Text>

      {request.decisionComment && <Text className="italic font-bold">{request.decisionComment}</Text>}

      <Text>
        Here you can find request details&nbsp;
        <Link href={`${BASE_URL}/private-cloud/requests/${request.id}/decision`}>Request Info</Link>
      </Text>
      <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <ProductDetails
        name={decisionData.name}
        description={decisionData.description}
        ministry={decisionData.ministry}
        po={decisionData.projectOwner}
        tl1={decisionData.primaryTechnicalLead}
        tl2={decisionData.secondaryTechnicalLead}
      />

      <NamespaceDetails cluster={request.decisionData.cluster} />
    </PrivateCloudLayout>
  );
}
