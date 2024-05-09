import * as React from 'react';
import { Link, Button, Heading, Text } from '@react-email/components';
import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  request: PublicCloudRequestWithRequestedProject;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
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
        <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your requested change for the project set for {name} on the Public Cloud Landing Zone AWS is now complete. If
          you have any more questions, reach out to the Public cloud team in the Rocket.Chat channel{' '}
          <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/aws-tenant-requests`}>
            #aws-tenant-requests
          </Link>
          .
        </Text>
        <Button
          href="https://registry.developer.gov.bc.ca/public-cloud/products/all"
          className="bg-bcorange rounded-md px-4 py-2 text-white"
        >
          Log in to Console
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
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <div>
          <Heading className="text-lg">Comments</Heading>
          <div> {request.decisionComment}</div>
        </div>
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default RequestApprovalTemplate;
