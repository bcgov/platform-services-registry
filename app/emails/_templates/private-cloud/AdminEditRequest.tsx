import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import Layout from '@/emails/_components/layout/Layout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  userName: string;
}

const NewRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);
  const requestComment = request.requestComment ?? undefined;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">New Request!</Heading>
        <Text>Hi Registry Team, </Text>
        <Text className="">
          There is a new request that requires your review. Log in to the Registry to review the details. If you have
          any questions about the request, the PO and TL contact details are included below and in the Registry.
        </Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Review Request
        </Button>
      </div>
      <div className="pb-6 mt-2 mb-2 border-solid border-0 border-b-1 border-slate-300">
        <Comment requestComment={requestComment} />
      </div>
      <div>
        <ProductDetails
          name={request.decisionData.name}
          description={request.decisionData.description}
          ministry={request.decisionData.ministry}
          po={request.decisionData.projectOwner}
          tl1={request.decisionData.primaryTechnicalLead}
          tl2={request.decisionData.secondaryTechnicalLead}
        />
      </div>
      <div>
        <NamespaceDetails cluster={request.decisionData.cluster} showNamespaceDetailsTitle={false} />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        {(changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota) && (
          <Heading className="text-lg mb-0 text-black">Quota Changes</Heading>
        )}
        <div className="flex flex-row flex-wrap">
          {changed.productionQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-prod`}
              quotaCurrent={current.productionQuota}
              quotaRequested={requested.productionQuota}
              type="Production"
              cluster={current.cluster}
            />
          )}
          {changed.testQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-test`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Test"
              cluster={current.cluster}
            />
          )}
          {changed.developmentQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-dev`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Development"
              cluster={current.cluster}
            />
          )}
          {changed.toolsQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-tools`}
              quotaCurrent={current.testQuota}
              quotaRequested={requested.testQuota}
              type="Tools"
              cluster={current.cluster}
            />
          )}
        </div>
        <Text>This edit request was actioned by {userName}.</Text>
      </div>
    </Layout>
  );
};

export default NewRequestTemplate;
