import * as React from 'react';
import { Button, Heading, Text, Link } from '@react-email/components';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';
import ProductDetails from '@/emails/_components/ProductDetails';
import Closing from '@/emails/_components/Closing';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your request for a resource quota has been completed for {request.requestedProject.name} on the Private Cloud
          OpenShift platform. You can now login to{' '}
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
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
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
        {(changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota) && (
          <h3 className="mb-0 text-black">Resource quota changes</h3>
        )}
        <div className="flex flex-row flex-wrap">
          {changed.productionQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-prod`}
              quotaCurrent={current.productionQuota}
              quotaRequested={requested.productionQuota}
              type="Production"
              cluster={current.cluster}
              currentLabel="Previous"
              requestedLabel="Updated"
            />
          )}
          {changed.testQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-test`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Test"
              cluster={current.cluster}
              currentLabel="Previous"
              requestedLabel="Updated"
            />
          )}
          {changed.developmentQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-dev`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Development"
              cluster={current.cluster}
              currentLabel="Previous"
              requestedLabel="Updated"
            />
          )}
          {changed.toolsQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-tools`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Tools"
              cluster={current.cluster}
              currentLabel="Previous"
              requestedLabel="Updated"
            />
          )}
        </div>
      </div>

      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default RequestApprovalTemplate;
