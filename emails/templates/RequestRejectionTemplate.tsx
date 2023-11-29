import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../components/Closing';
import { TailwindConfig } from '../components/TailwindConfig';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
  comment: string;
}

export const RequestRejectionTemplate = ({ request, comment }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Sorry, your provisioning request was Rejected</Heading>
                <Text>Hi {request.requestedProject.projectOwner.firstName}, </Text>
                <Text className="">
                  Your request for a new project set for your product on the Private Cloud Openshift platform is
                  rejected due to the following reason(s):
                </Text>
                <Text className="">sample reason</Text>
                <Text>
                  Log in to your registry account and raise a new request if the above rejection reason no longer
                  applies
                </Text>
                <Button
                  href="https://dev-pltsvc.apps.silver.devops.gov.bc.ca/private-cloud/products"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Log in to Registry
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Comments</Heading>
                <Text className="mb-0">{comment}</Text>
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

export default RequestRejectionTemplate;
