import * as React from 'react';
import { Button, Heading, Text } from '@react-email/components';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import ProductDetails from '@/emails/_components/ProductDetails';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
  userName: string;
}

const NewRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">
          Provisioning request received for {request.decisionData.name} on OpenShift
        </Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">
          You have requested a new project set for {request.decisionData.name} on the Private Cloud OpenShift platform.
          Our administrators have been notified and will review your request.
        </Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          View request
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
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <NamespaceDetails cluster={request.decisionData.cluster} showNamespaceDetailsTitle={false} />
        <br></br>
        <Text>This create request was actioned by {userName}.</Text>
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default NewRequestTemplate;
