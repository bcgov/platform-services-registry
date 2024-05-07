import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
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
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
                <Text>Hi Product Team,</Text>
                <Text className="">
                  {`We have received your deletion request for ${request.decisionData.name}. You will receive an email once your request has been processed and completed.`}
                </Text>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={request.decisionData.name}
                  description={request.decisionData.description}
                  ministry={request.decisionData.ministry}
                  po={request.decisionData.projectOwner}
                  tl1={request.decisionData.primaryTechnicalLead}
                  tl2={request.decisionData.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails
                  cluster={request.decisionData.cluster}
                  licencePlate={request.decisionData.licencePlate}
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
