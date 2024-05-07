import * as React from 'react';
import ProductDetails from '@/emails/_components/ProductDetails';
import { Heading, Text } from '@react-email/components';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const ExpenseAuthorityTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
  } = product;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">New Expense Authority</Heading>
        <Text>Hi, {expenseAuthority?.firstName},</Text>
        <Text className="">You are now the Expense Authority for the the product {name} on the Public Cloud.</Text>
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
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default ExpenseAuthorityTemplate;
