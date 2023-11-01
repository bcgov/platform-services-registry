import { PrivateCloudCreateRequestBody } from '@/schema';
import * as React from 'react';
import Header from './components/Header';
import ProductDetails from './components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { sampleFormData } from './components/Params';
import NamespaceDetails from './components/NamespaceDetails';
import Closing from './components/Closing';
import { TailwindConfig } from './components/TailwindConfig';
const defaultTheme = require('tailwindcss/defaultTheme');

interface EmailProp {
  formData: PrivateCloudCreateRequestBody;
}

export const NewRequest = ({ formData }: EmailProp) => {
  if (!formData) {
    formData = sampleFormData;
  }
  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Provisioning Request!</Heading>
                <Text>Hi Registry Team, </Text>
                <Text className="">
                  There is a new request that requires your review. Log in to the Registry to review the details. If you
                  have any questions about the request, the PO and TL contact details are included below and in the
                  Registry
                </Text>
                <Button
                  href="https://dev-pltsvc.apps.silver.devops.gov.bc.ca/private-cloud/products"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Review Request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={formData.name}
                  description={formData.description}
                  ministry={formData.ministry}
                  po={formData.projectOwner}
                  tl1={formData.primaryTechnicalLead}
                  tl2={formData.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails cluster={formData.cluster} />
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

export default NewRequest;
