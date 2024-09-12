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

const NewRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={userName}>
      <Heading className="text-lg">New Request!</Heading>
      <Text>Hi Registry Team, </Text>
      <Text>
        There is a new request that requires your review. Log in to the Registry to review the details. If you have any
        questions about the request, the PO and TL contact details are included below and in the Registry.
      </Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        Review Request
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
};

export default NewRequestTemplate;
