import * as React from 'react';
import Header from '../../components/Header';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../components/Closing';
import { TailwindConfig } from '../../components/TailwindConfig';
import ProductDetails from '../../components/ProductDetails';
import ProviderDetails from '../../components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/nats/publicCloud';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const DeleteRequestTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs lassName='text-darkergrey'">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">
                  Your deletion request for Private Cloud Openshift Platform has been received!
                </Heading>
                <Text>Hi {product.name} Team,</Text>
                <Text className="">
                  {`We have received your deletion request for ${product.name}. You will receive an email once your request has been processed.`}
                </Text>
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
                <ProviderDetails provider={product.provider} />
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

export default DeleteRequestTemplate;
