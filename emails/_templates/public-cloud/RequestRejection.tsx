import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import Comment from '@/emails/_components/Comment';

interface EmailProp {
  productName: string;
  decisionComment?: string;
}

const RequestRejectionTemplate = ({ productName, decisionComment }: EmailProp) => {
  if (!productName) return <></>;
  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
                <Text>Hi Product Team, </Text>
                <Text className="">
                  Your request for the product on the Public Cloud Landing Zone has been rejected due to the following
                  reason(s):
                </Text>
                <Comment decisionComment={decisionComment} />
                <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/public-cloud/products/active-requests"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Log in to Registry
                </Button>
              </div>
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default RequestRejectionTemplate;
