import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Layout from '@/emails/_components/layout/Layout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">New Request!</Heading>
        <Text>Hi Registry Team, </Text>
        <Text className="">
          There is a new request that requires your review. Log in to the Registry to review the details. If you have
          any questions about the request, the PO and TL contact details are included below and in the Registry.
        </Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Review Request
        </Button>
      </div>
      <div>
        <ProductDetails
          name={request.decisionData.name}
          description={request.decisionData.description}
          ministry={request.decisionData.ministry}
          po={request.decisionData.projectOwner}
          tl1={request.decisionData.primaryTechnicalLead}
          tl2={request.decisionData.secondaryTechnicalLead}
        />
      </div>
      <div>
        <NamespaceDetails cluster={request.decisionData.cluster} showNamespaceDetailsTitle={false} />
      </div>
    </Layout>
  );
};

export default NewRequestTemplate;
