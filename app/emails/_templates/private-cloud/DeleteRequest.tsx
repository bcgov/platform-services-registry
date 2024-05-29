import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
  userName: string;
}

const DeleteRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">
          {`We have received your deletion request for ${request.decisionData.name}. You will receive an email once your request has been processed and completed.`}
        </Text>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
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
        <NamespaceDetails cluster={request.decisionData.cluster} licencePlate={request.decisionData.licencePlate} />
        <br></br>
        <Text>This delete request was actioned by {userName}.</Text>
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default DeleteRequestTemplate;
