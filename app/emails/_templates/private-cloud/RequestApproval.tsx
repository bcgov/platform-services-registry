import { Button, Heading, Text, Link } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);

  const hasQuotaChanges =
    changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your request for {hasQuotaChanges ? 'a resource quota' : 'your product'} has been completed for{' '}
          {request.decisionData.name} on the Private Cloud OpenShift platform. You can now login to{' '}
          <Link className="mt-0 h-4" href={`https://console.apps.${request.decisionData.cluster}.devops.gov.bc.ca/`}>
            OpenShift cluster console{' '}
          </Link>{' '}
          {hasQuotaChanges ? 'and you will see your new resource quota values.' : 'to manage your product.'}
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
          name={request.decisionData.name}
          description={request.decisionData.description}
          ministry={request.decisionData.ministry}
          po={request.decisionData.projectOwner}
          tl1={request.decisionData.primaryTechnicalLead}
          tl2={request.decisionData.secondaryTechnicalLead}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        {hasQuotaChanges && (
          <>
            <h3 className="mb-0 text-black">Resource quota changes</h3>
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
                  quotaCurrent={current.developmentQuota}
                  quotaRequested={requested.developmentQuota}
                  type="Development"
                  cluster={current.cluster}
                  currentLabel="Previous"
                  requestedLabel="Updated"
                />
              )}
              {changed.toolsQuota && (
                <QuotaChanges
                  licencePlate={`${request.licencePlate}-tools`}
                  quotaCurrent={current.toolsQuota}
                  quotaRequested={requested.toolsQuota}
                  type="Tools"
                  cluster={current.cluster}
                  currentLabel="Previous"
                  requestedLabel="Updated"
                />
              )}
            </div>
          </>
        )}
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default RequestApprovalTemplate;
