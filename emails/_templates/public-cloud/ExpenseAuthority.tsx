import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';

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
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Expense Authority</Heading>
                <Text>Hi, {expenseAuthority?.firstName},</Text>
                <Text className="">
                  You are now the Expense Authority for the the product {name} on the Public Cloud.
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
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
                <Text className="">The Cloud Pathfinder team </Text>
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default ExpenseAuthorityTemplate;
