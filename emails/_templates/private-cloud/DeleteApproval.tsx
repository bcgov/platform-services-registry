import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import ProductDetails from '../../_components/ProductDetails';
import NamespaceDetails from '../../_components/NamespaceDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

const DeleteApprovalTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs lassName='text-darkergrey'">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Your deletion request has been completed!</Heading>
                <Text>Hi {product.name} Team,</Text>
                <Text className="">{`Your request for a project set deletion for ${product.name} is complete.`}</Text>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={product.name}
                  description={product.description}
                  ministry={product.ministry}
                  po={product.projectOwner}
                  tl1={product.primaryTechnicalLead}
                  tl2={product.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails cluster={product.cluster} licencePlate={product.licencePlate} />
              </div>
              <div>
                <Closing />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default DeleteApprovalTemplate;
