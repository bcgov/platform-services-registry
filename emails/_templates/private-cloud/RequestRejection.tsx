import * as React from 'react';
import { Button, Heading, Text } from '@react-email/components';
import Closing from '@/emails/_components/Closing';
import Comment from '@/emails/_components/Comment';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  productName: string;
  decisionComment?: string;
  request: PrivateCloudRequestWithProjectAndRequestedProject;
}

const RequestRejectionTemplate = ({ request, productName, decisionComment }: EmailProp) => {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your request regarding the product {productName} on the Private Cloud Openshift platform has been rejected due
          to the following reason(s):
        </Text>
        <Comment decisionComment={decisionComment} />
        <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Log in to Registry
        </Button>
      </div>
      <div className="flex flex-row flex-wrap">
        {changed.productionQuota && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-prod`}
            quotaCurrent={current.productionQuota}
            quotaRequested={requested.productionQuota}
            type="Production"
            cluster={current.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {changed.testQuota && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-test`}
            quotaCurrent={current.testQuota}
            quotaRequested={requested.testQuota}
            type="Test"
            cluster={current.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {changed.developmentQuota && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-dev`}
            quotaCurrent={current.testQuota}
            quotaRequested={requested.testQuota}
            type="Development"
            cluster={current.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {changed.toolsQuota && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-tools`}
            quotaCurrent={current.testQuota}
            quotaRequested={requested.testQuota}
            type="Tools"
            cluster={current.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
      </div>

      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default RequestRejectionTemplate;
