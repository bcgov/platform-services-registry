import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import Closing from '@/emails/_components/Closing';
import Comment from '@/emails/_components/Comment';
import ContactChanges from '@/emails/_components/Edit/ContactChanges';
import DescriptionChanges from '@/emails/_components/Edit/DescriptionChanges';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import Layout from '@/emails/_components/layout/Layout';
import { isQuotaUpgrade } from '@/helpers/quota-change';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
  userName: string;
}

const EditRequestTemplate = ({ request, userName }: EmailProp) => {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);
  const isQuotaUpgraded = isQuotaUpgrade(requested, current);
  const requestComment = request.requestComment ?? undefined;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">New edit product request!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          You have submitted an edit request for your product with the licence plate {request.licencePlate}.
          {(changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota) &&
          isQuotaUpgraded
            ? ' Our administrators have been notified and will review your request.'
            : ' Your request will be reviewed automatically. Once the provisioning is complete, you will receive a notification email with all the relevant details and updates regarding your request.'}
        </Text>
        <Button
          href={`${BASE_URL}/private-cloud/requests/${request.id}/summary`}
          className="bg-bcorange rounded-md px-4 py-2 text-white"
        >
          View request
        </Button>
      </div>
      {requestComment && (
        <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
          <Heading className="text-lg text-black">Comments</Heading>
          <Comment requestComment={requestComment} />
        </div>
      )}
      {(changed.name || changed.description || changed.ministry || changed.cluster) && (
        <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
          <DescriptionChanges
            nameCurrent={current.name}
            descCurrent={current.description}
            ministryCurrent={current.ministry}
            nameRequested={requested.name}
            descRequested={requested.description}
            ministryRequested={requested.ministry}
          />
        </div>
      )}
      {(changed.projectOwnerId || changed.primaryTechnicalLeadId || changed.secondaryTechnicalLeadId) && (
        <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
          <ContactChanges
            poCurrent={current.projectOwner}
            tl1Current={current.primaryTechnicalLead}
            tl2Current={current?.secondaryTechnicalLead}
            poRequested={requested.projectOwner}
            tl1Requested={requested.primaryTechnicalLead}
            tl2Requested={requested?.secondaryTechnicalLead}
          />
        </div>
      )}
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
              quotaCurrent={current.developmentQuota}
              quotaRequested={requested.developmentQuota}
              type="Development"
              cluster={current.cluster}
            />
          )}
          {changed.toolsQuota && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-tools`}
              quotaCurrent={current.toolsQuota}
              quotaRequested={requested.toolsQuota}
              type="Tools"
              cluster={current.cluster}
            />
          )}
          <br></br>
          <Text>This edit request was actioned by {userName}.</Text>
        </div>
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default EditRequestTemplate;
