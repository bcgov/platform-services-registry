import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function TeamDeleteRequestCompletion({ request }: EmailProp) {
  if (!request) return <></>;

  const { decisionData } = request;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Your deletion request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>{`The project set deletion for ${decisionData.name} has been successfully completed.`}</Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <ProductDetails
        name={decisionData.name}
        description={decisionData.description}
        ministry={decisionData.ministry}
        po={decisionData.projectOwner}
        tl1={decisionData.primaryTechnicalLead}
        tl2={decisionData.secondaryTechnicalLead}
      />

      <NamespaceDetails cluster={decisionData.cluster} licencePlate={decisionData.licencePlate} />
    </PrivateCloudLayout>
  );
}
