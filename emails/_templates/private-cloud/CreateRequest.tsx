import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import NamespaceDetails from '../../_components/NamespaceDetails';
import Closing from '../../_components/Closing';
import { twj } from '../../_components/tailwind';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <div style={twj('border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl')}>
        <Header />
        <Body style={twj('bg-white my-auto mx-auto font-sans text-xs text-darkergrey')}>
          <div style={twj('m-12')}>
            <div style={twj('pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300')}>
              <Heading style={twj('text-lg')}>
                Provisioning request received for {request.requestedProject.name} on OpenShift
              </Heading>
              <Text>Hi Product Team,</Text>
              <Text>
                You have requested a new project set for {request.requestedProject.name} on the Private Cloud OpenShift
                platform. Our administrators have been notified and will review your request.
              </Text>
              <Button
                href="https://registry.developer.gov.bc.ca/"
                style={twj('bg-bcorange rounded-md px-4 py-2 text-white')}
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
            <div style={twj('pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300')}>
              <NamespaceDetails cluster={request.requestedProject.cluster} showNamespaceDetailsTitle={false} />
            </div>
            <div>
              <Closing />
            </div>
          </div>
        </Body>
      </div>
    </Html>
  );
};

export default NewRequestTemplate;
