import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import { comparePrivateCloudProjects } from '../../_components/Edit/utils/compare-projects';
import ContactChanges from '../../_components/Edit/ContactChanges';
import QuotaChanges from '../../_components/Edit/QuotaChanges';
import DescriptionChanges from '../../_components/Edit/DescriptionChanges';
import { BASE_URL } from '@/config';
import Comment from '@/emails/_components/Comment';
import { isQuotaUpgrade } from '@/helpers/quota-change';
import { PrivateCloudEditRequestBody } from '@/schema';
interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
}

const EditRequestTemplate = ({ request }: EmailProp) => {
  if (!request || !request.project || !request.requestedProject) return <></>;
  const current = request.project;
  const requested = request.requestedProject;
  const changed = comparePrivateCloudProjects(current, requested);
  const isQuotaUpgraded = isQuotaUpgrade(
    requested as PrivateCloudEditRequestBody,
    current as PrivateCloudEditRequestBody,
  );
  const requestComment = request.requestComment ?? undefined;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">New edit product request!</Heading>
                <Text>Hi Product Team, </Text>
                <Text className="">
                  You have submitted an edit request for your product with the license plate {request.licencePlate}.
                  {(changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota) &&
                  isQuotaUpgraded
                    ? ' Our administrators have been notified and will review your request.'
                    : ' Your request will be reviewed authomatically. Once the provisioning is complete, you will receive a notification email with all the relevant details and updates regarding your request.'}
                </Text>
                <Button href={BASE_URL} className="bg-bcorange rounded-md px-4 py-2 text-white">
                  View request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Comments</Heading>
                <Comment requestComment={requestComment} />
              </div>
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

export default EditRequestTemplate;
