import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  userName: string;
}

export default function CreateRequest({ request, userName }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={userName}>
      <Heading className="text-lg">Provisioning request received for {request.decisionData.name} on OpenShift</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        You have requested a new project set for {request.decisionData.name} on the Private Cloud OpenShift platform.
        Our administrators have been notified and will review your request.
      </Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        View request
      </Button>

      <Hr className="my-4" />

      <ProductDetails
        name={request.decisionData.name}
        description={request.decisionData.description}
        ministry={request.decisionData.ministry}
        po={request.decisionData.projectOwner}
        tl1={request.decisionData.primaryTechnicalLead}
        tl2={request.decisionData.secondaryTechnicalLead}
      />

      <NamespaceDetails cluster={request.decisionData.cluster} showNamespaceDetailsTitle={false} />
    </PrivateCloudLayout>
  );
}
