import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import Closing from '@/emails/_components/Closing';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
  userName: string;
}

const DeleteRequestTemplate = ({ product, userName }: EmailProp) => {
  if (!product) return <></>;

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
  } = product;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">
          {`We have received your deletion request for ${product.name}. You will receive an email once your request has been processed and completed.`}
        </Text>
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
        <Text>This delete request was actioned by {userName}.</Text>
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default DeleteRequestTemplate;
