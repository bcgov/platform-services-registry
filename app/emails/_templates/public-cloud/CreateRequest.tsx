import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';

interface EmailProp {
  request: PublicCloudRequestWithRequestedProject;
  userName: string;
}

const CreateRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    provider,
    accountCoding,
    budget,
    licencePlate,
  } = request.decisionData;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">
          Provisioning request received for {name} on {provider}
        </Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">
          You have requested a new project set for {name} on the Public Cloud Landing Zone - {provider}. Our
          administrators have been notified and will review your request.
        </Text>
        <Button
          href="https://registry.developer.gov.bc.ca/public-cloud/requests/all"
          className="bg-bcorange rounded-md px-4 py-2 text-white"
        >
          View request
        </Button>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={name}
          description={description}
          ministry={ministry}
          po={projectOwner}
          tl1={primaryTechnicalLead}
          tl2={secondaryTechnicalLead}
          expenseAuthority={expenseAuthority}
          licencePlate={licencePlate}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProviderDetails provider={provider} accountCoding={accountCoding} budget={budget} />
        <br></br>
        <Text>This create request was actioned by {userName}.</Text>
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default CreateRequestTemplate;
