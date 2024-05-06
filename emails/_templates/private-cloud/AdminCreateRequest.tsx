import { PrivateCloudRequestWithRequestedProject } from '@/request-actions/private-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import NamespaceDetails from '../../_components/NamespaceDetails';
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
              <Heading style={twj('text-lg')}>New Request!</Heading>
              <Text>Hi Registry Team, </Text>
              <Text>
                There is a new request that requires your review. Log in to the Registry to review the details. If you
                have any questions about the request, the PO and TL contact details are included below and in the
                Registry.
              </Text>
              <Button
                href="https://registry.developer.gov.bc.ca/"
                style={twj('bg-bcorange rounded-md px-4 py-2 text-white')}
              >
                Review Request
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
            <div>
              <NamespaceDetails cluster={request.requestedProject.cluster} showNamespaceDetailsTitle={false} />
            </div>
          </div>
        </Body>
      </div>
    </Html>
  );
};

export default NewRequestTemplate;
