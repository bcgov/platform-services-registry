import { Button, Heading, Text, Link } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

const CreateRequestApprovalTemplate = ({ request }: EmailProp) => {
  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Success! Your create request was approved!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          We are pleased to inform you that your request to create the product {request.decisionData.name} has been
          approved on the Private Cloud OpenShift platform. Please allow 3-5 minutes for the request to be processed. If
          it takes longer, don&apos;t hesitate to reach out to us. You can now log in to{' '}
          <Link className="mt-0 h-4" href={`https://console.apps.${request.decisionData.cluster}.devops.gov.bc.ca/`}>
            OpenShift cluster console{' '}
          </Link>{' '}
          to manage your product.
        </Text>
        <Text className="">
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
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default CreateRequestApprovalTemplate;
