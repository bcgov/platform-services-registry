import * as React from 'react';
import Header from '../../_components/Header';
import { Link, Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import ProductDetails from '../../_components/ProductDetails';
import ProviderDetails from '../../_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/nats/publicCloud';

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
    provider,
    accountCoding,
    budget,
  } = product;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Hurray! Your request was approved and completed!</Heading>
                <Text>Hi {product.name} Team, </Text>
                <Text className="">
                  Your request for your product on the Public Cloud platform is complete. If you have any more questions
                  reach out to the Platform Services team in the RocketChat channel{' '}
                  <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
                    #devops&#8209;operations
                  </Link>
                </Text>
                <Text className="">
                  The Product Owner and the Technical Lead have been provisioned with access, and can add other users as
                  necessary. Please note that if a Product Owner or a Technical Lead is removed as a project contact in
                  the Platform Registry, they will lose their access to the project set namespaces. The new Product or
                  Technical Lead provided on the product details page will gain the access to the namespaces.
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
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProviderDetails provider={provider} accountCoding={accountCoding} budget={budget} />
              </div>
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default ProvisionedTemplate;
