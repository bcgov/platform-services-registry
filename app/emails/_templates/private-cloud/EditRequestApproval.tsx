import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import ContactChanges from '@/emails/_components/Edit/ContactChanges';
import DescriptionChanges from '@/emails/_components/Edit/DescriptionChanges';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import { comparePrivateCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function EditRequestApproval({ request }: EmailProp) {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePrivateCloudProjects(current, requested);
  const requestComment = request.requestComment ?? undefined;
  const hasQuotaChanged =
    changed.productionQuota || changed.testQuota || changed.developmentQuota || changed.toolsQuota;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Success! Your edit request was approved!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        We are pleased to inform you that your request for a resource quota has been approved on the Private Cloud
        OpenShift platform. Please allow 3-5 minutes for the request to be processed. If it takes longer, don&apos;t
        hesitate to reach out to us.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Platform Services team in the
        Rocket.Chat channel{' '}
        <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
          #devops-operations
        </Link>
        .
      </Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        Log in to Console
      </Button>

      <Hr className="my-4" />

      <ProductDetails
        name={request.decisionData.name}
        description={request.decisionData.description}
        ministry={request.decisionData.ministry}
        po={request.decisionData.projectOwner}
        tl1={request.decisionData.primaryTechnicalLead}
        tl2={request.decisionData.secondaryTechnicalLead}
      />

      <Comment requestComment={requestComment} />

      {(changed.name || changed.description || changed.ministry || changed.cluster) && (
        <>
          <Hr className="my-4" />
          <DescriptionChanges
            nameCurrent={current.name}
            descCurrent={current.description}
            ministryCurrent={current.ministry}
            nameRequested={requested.name}
            descRequested={requested.description}
            ministryRequested={requested.ministry}
          />
        </>
      )}

      {(changed.projectOwnerId || changed.primaryTechnicalLeadId || changed.secondaryTechnicalLeadId) && (
        <>
          <Hr className="my-4" />
          <ContactChanges
            poCurrent={current.projectOwner}
            tl1Current={current.primaryTechnicalLead}
            tl2Current={current?.secondaryTechnicalLead}
            poRequested={requested.projectOwner}
            tl1Requested={requested.primaryTechnicalLead}
            tl2Requested={requested?.secondaryTechnicalLead}
          />
        </>
      )}

      {hasQuotaChanged && (
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
    </PrivateCloudLayout>
  );
}
