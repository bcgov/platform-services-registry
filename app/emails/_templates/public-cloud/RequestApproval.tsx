import { Link, Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
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
    billing,
    budget,
    licencePlate,
    environmentsEnabled,
  } = request.decisionData;

  const { accountCoding } = billing;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your requested change for the project set for {name} on the Public Cloud Landing Zone {provider} is now
          complete. If you have any more questions, reach out to the Public cloud team in the Rocket.Chat channel{' '}
          <Link
            className="mt-0 h-4"
            href={`https://chat.developer.gov.bc.ca/group/${provider.toLowerCase()}-tenant-requests`}
          >
            {` #${provider.toLowerCase()}-tenant-requests`}
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
        <ProviderDetails
          provider={provider}
          accountCoding={accountCoding}
          budget={budget}
          environmentsEnabled={environmentsEnabled}
        />
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
