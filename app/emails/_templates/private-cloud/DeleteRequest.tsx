import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  userName: string;
}

const DeleteRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout requester={userName ?? 'System Admin'}>
      <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We have received your deletion request for {request.decisionData.name}. You will receive an email once your
        request has been processed and completed.
      </Text>

      <Hr className="my-4" />

      <ProductDetails
        name={request.decisionData.name}
        description={request.decisionData.description}
        ministry={request.decisionData.ministry}
        po={request.decisionData.projectOwner}
        tl1={request.decisionData.primaryTechnicalLead}
        tl2={request.decisionData.secondaryTechnicalLead}
      />

      <Hr className="my-4" />

      <NamespaceDetails cluster={request.decisionData.cluster} licencePlate={request.decisionData.licencePlate} />
    </PrivateCloudLayout>
  );
};

export default DeleteRequestTemplate;
