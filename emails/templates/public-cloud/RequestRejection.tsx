import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../components/Closing';
import { TailwindConfig } from '../../components/TailwindConfig';

interface EmailProp {
  productName: string;
  comment?: string;
}

const RequestRejectionTemplate = ({ productName, comment }: EmailProp) => {
  if (!productName) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Sorry, your request was Rejected</Heading>
                <Text>Hi {productName} team, </Text>
                <Text className="">
                  Your request for the product on the Public Cloud Landing Zone has been rejected due to the following
                  reason(s):
                </Text>
                <Text className="">{comment}</Text>
                <Text>
                  Log in to your registry account and raise a new request if the above rejection reason no longer
                  applies
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/"
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
                <Closing email="Cloud.Pathfinder@gov.bc.ca" />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default RequestRejectionTemplate;
