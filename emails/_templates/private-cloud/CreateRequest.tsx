import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import NamespaceDetails from '../../_components/NamespaceDetails';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">
                  Provisioning request received for {request.requestedProject.name} on OpenShift
                </Heading>
                <Text>Hi Product Team,</Text>
                <Text className="">
                  You have requested a new project set for {request.requestedProject.name} on the Private Cloud
                  OpenShift platform. Our administrators have been notified and will review your request.
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  View request
                </Button>
              </div>
              <div>
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
                <NamespaceDetails cluster={request.requestedProject.cluster} showNamespaceDetailsTitle={false} />
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

export default NewRequestTemplate;
