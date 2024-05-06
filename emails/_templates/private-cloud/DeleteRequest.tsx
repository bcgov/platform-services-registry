import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { tailwindConfig } from '../../_components/tailwind';
import ProductDetails from '../../_components/ProductDetails';
import NamespaceDetails from '../../_components/NamespaceDetails';
import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const DeleteRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
                <Text>Hi Product Team,</Text>
                <Text className="">
                  {`We have received your deletion request for ${request.requestedProject.name}. You will receive an email once your request has been processed and completed.`}
                </Text>
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
                <NamespaceDetails
                  cluster={request.requestedProject.cluster}
                  licencePlate={request.requestedProject.licencePlate}
                />
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
