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

const styles = [
  twj('border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl'),
  twj('bg-white my-auto mx-auto font-sans text-xs text-darkergrey'),
  twj('m-12'),
  twj('pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300'),
  twj('text-lg'),
  twj('bg-bcorange rounded-md px-4 py-2 text-white'),
];

const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <div style={styles[0]}>
        <Header />
        <Body style={styles[1]}>
          <div style={styles[2]}>
            <div style={styles[3]}>
              <Heading style={styles[4]}>New Request!</Heading>
              <Text>Hi Registry Team, </Text>
              <Text>
                There is a new request that requires your review. Log in to the Registry to review the details. If you
                have any questions about the request, the PO and TL contact details are included below and in the
                Registry.
              </Text>
              <Button href="https://registry.developer.gov.bc.ca/" style={styles[5]}>
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
