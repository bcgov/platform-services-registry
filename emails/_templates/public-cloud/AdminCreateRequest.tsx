import { PublicCloudRequestWithRequestedProject } from '@/requestActions/public-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import NamespaceDetails from '../../_components/NamespaceDetails';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';

interface EmailProp {
  request: PublicCloudRequestWithRequestedProject;
}

export default function NewRequestTemplate({ request }: EmailProp) {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Request!</Heading>
                <Text>Hi Public Cloud Team, </Text>
                <Text className="">
                  There is a new request that requires your review. Log in to the Registry to review the details. If you
                  have any questions about the request, the PO and TL contact details are included below and in the
                  Registry
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Review Request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={request.requestedProject.name}
                  description={request.requestedProject.description}
                  ministry={request.requestedProject.ministry}
                  po={request.requestedProject.projectOwner}
                  tl1={request.requestedProject.primaryTechnicalLead}
                  tl2={request.requestedProject.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails cluster={request.requestedProject.provider} />
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
}
