import * as React from 'react';
import Header from '../../_components/Header';
import { Link, Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import ProductDetails from '../../_components/ProductDetails';
import ProviderDetails from '../../_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const ProvisionedTemplate = ({ product }: EmailProp) => {
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
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
                <Text>Hi Product Team, </Text>
                <Text className="">
                  Your request for your product on the Public Cloud platform is complete. If you have any more questions
                  reach out to the Public Cloud team in the Rocket.Chat channel{' '}
                  <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/group/aws-tenant-requests`}>
                    #aws-tenant-requests
                  </Link>
                  .
                </Text>
                <Text className="">
                  The Product Owner and the Technical Lead(s) are granted access to the registry and can login to the
                  registry now and manage users with product set roles.{' '}
                </Text>
                <Text className="">
                  Removing a Product Owner or Technical Lead(s) as project contacts in the Platform Product Registry
                  will revoke their access to the Registry. The newly added Product Owner Technical Lead(s) on the
                  product details page will then gain access to the registry and can manage access to the project set
                  accounts in AWS.
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
              </div>
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default ProvisionedTemplate;
