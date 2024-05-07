import * as React from 'react';
import { Button, Heading, Text } from '@react-email/components';
import Closing from '@/emails/_components/Closing';
import Comment from '@/emails/_components/Comment';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  productName: string;
  decisionComment?: string;
}

const RequestRejectionTemplate = ({ productName, decisionComment }: EmailProp) => {
  if (!productName) return <></>;

  return (
    <Layout>
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
          href="https://registry.developer.gov.bc.ca/public-cloud/requests/active"
          className="bg-bcorange rounded-md px-4 py-2 text-white"
        >
          Log in to Registry
        </Button>
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default RequestRejectionTemplate;
