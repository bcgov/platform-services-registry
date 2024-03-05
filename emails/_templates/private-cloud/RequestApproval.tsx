import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Text, Link } from '@react-email/components';
import NamespaceDetails from '../../_components/NamespaceDetails';
import Closing from '../../_components/Closing';
import TailwindWrapper from '../../_components/TailwindWrapper';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <TailwindWrapper>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
                <Text>Hi Product Team, </Text>
                <Text className="">
                  Your request for a resource quota has been completed for {request.requestedProject.name} on the
                  Private Cloud OpenShift platform. You can now login to{' '}
                  <Link
                    className="mt-0 h-4"
                    href={`https://console.apps.${request.requestedProject.cluster}.devops.gov.bc.ca/`}
                  >
                    OpenShift cluster console{' '}
                  </Link>{' '}
                  and you will see your new resource quota values.
                </Text>
                <Text className="">
                  If you have any more questions, reach out to the Platform Services team in the Rocket.Chat channel{' '}
                  <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
                    #devops-operations
                  </Link>
                  .
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Log in to Console
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
                <NamespaceDetails cluster={request.requestedProject.cluster} licencePlate={request.licencePlate} />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <div>
                  <Heading className="text-lg">Comment</Heading>
                  <div> {request.decisionComment}</div>
                </div>
              </div>
              <div>
                <Closing />
              </div>
            </div>
          </Body>
        </div>
      </TailwindWrapper>
    </Html>
  );
};

export default RequestApprovalTemplate;
