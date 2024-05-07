import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import Closing from '@/emails/_components/Closing';
import ProductDetails from '@/emails/_components/ProductDetails';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const DeleteRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">
          {`We have received your deletion request for ${request.requestedProject.name}. You will receive an email once your request has been processed and completed.`}
        </Text>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={request.requestedProject.name}
          description={request.requestedProject.description}
          ministry={request.requestedProject.ministry}
          po={request.requestedProject.projectOwner}
          tl1={request.requestedProject.primaryTechnicalLead}
          tl2={request.requestedProject.secondaryTechnicalLead}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <NamespaceDetails
          cluster={request.requestedProject.cluster}
          licencePlate={request.requestedProject.licencePlate}
        />
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default DeleteRequestTemplate;
