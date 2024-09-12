import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function CreateRequestApproval({ request }: EmailProp) {
  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Success! Your create request was approved!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        We are pleased to inform you that your request to create the product {request.decisionData.name} has been
        approved on the Private Cloud OpenShift platform. Please allow 3-5 minutes for the request to be processed. If
        it takes longer, don&apos;t hesitate to reach out to us.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Platform Services team in the
        Rocket.Chat channel{' '}
        <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
          #devops-operations
        </Link>
        .
      </Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        Log in to Console
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
    </PrivateCloudLayout>
  );
}
