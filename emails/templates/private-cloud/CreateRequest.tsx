import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../components/Header';
import ProductDetails from '../../components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import NamespaceDetails from '../../components/NamespaceDetails';
import Closing from '../../components/Closing';
import { TailwindConfig } from '../../components/TailwindConfig';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

export const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Request!</Heading>
                <Text>Hi {request.requestedProject.name} Team, </Text>
                <Text className="">
                  You have requested a new project set for your product on the Private Cloud Openshift platform. Our
                  administrators have been notified and will review your request.
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
                  name={request.requestedProject.name}
                  description={request.requestedProject.description}
                  ministry={request.requestedProject.ministry}
                  po={request.requestedProject.projectOwner}
                  tl1={request.requestedProject.primaryTechnicalLead}
                  tl2={request.requestedProject.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails cluster={request.requestedProject.cluster} />
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
