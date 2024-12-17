import { Heading, Link, Text, Hr } from '@react-email/components';
import ContactChanges from '@/emails/_components/ContactChanges';
import DescriptionChanges from '@/emails/_components/DescriptionChanges';
import MemberChanges from '@/emails/_components/MemberChanges';
import QuotaChanges from '@/emails/_components/QuotaChanges';
import { comparePrivateProductData } from '@/helpers/product-change';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export default function Changes({ request }: { request: PrivateCloudRequestDetail }) {
  if (!request.originalData) return null;

  const diffData = comparePrivateProductData(request.originalData, request.decisionData);

  let profileChange = null;
  let contactChange = null;
  let membersChange = null;
  let quotaChange = null;
  let webhookUrlChange = null;

  if (diffData.profileChanged) {
    profileChange = (
      <>
        <Hr className="my-4" />
        <DescriptionChanges
          nameCurrent={request.originalData.name}
          descCurrent={request.originalData.description}
          ministryCurrent={request.originalData.ministry}
          nameRequested={request.decisionData.name}
          descRequested={request.decisionData.description}
          ministryRequested={request.decisionData.ministry}
        />
      </>
    );
  }

  if (diffData.membersChanged) {
    membersChange = (
      <>
        <Hr className="my-4" />
        <MemberChanges data={diffData.changes.filter((change) => change.loc.startsWith('members.'))} />
      </>
    );
  }

  if (diffData.contactsChanged) {
    contactChange = (
      <>
        <Hr className="my-4" />
        <ContactChanges
          poCurrent={request.originalData.projectOwner}
          tl1Current={request.originalData.primaryTechnicalLead}
          tl2Current={request.originalData.secondaryTechnicalLead}
          poRequested={request.decisionData.projectOwner}
          tl1Requested={request.decisionData.primaryTechnicalLead}
          tl2Requested={request.decisionData.secondaryTechnicalLead}
        />
      </>
    );
  }

  if (diffData.quotasChanged) {
    quotaChange = (
      <>
        <Hr className="my-4" />
        <Heading className="text-lg mb-0 text-black">Quota Changes</Heading>
        <div className="flex flex-row flex-wrap">
          {diffData.changes.find((chg) => chg.loc.startsWith('resourceRequests.production.')) && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-prod`}
              currentResourceRequests={request.originalData.resourceRequests.production}
              requestedResourceRequests={request.decisionData.resourceRequests.production}
              type="Production"
              cluster={request.originalData.cluster}
            />
          )}
          {diffData.changes.find((chg) => chg.loc.startsWith('resourceRequests.test.')) && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-test`}
              currentResourceRequests={request.originalData.resourceRequests.test}
              requestedResourceRequests={request.decisionData.resourceRequests.test}
              type="Test"
              cluster={request.originalData.cluster}
            />
          )}
          {diffData.changes.find((chg) => chg.loc.startsWith('resourceRequests.development.')) && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-dev`}
              currentResourceRequests={request.originalData.resourceRequests.development}
              requestedResourceRequests={request.decisionData.resourceRequests.development}
              type="Development"
              cluster={request.originalData.cluster}
            />
          )}
          {diffData.changes.find((chg) => chg.loc.startsWith('resourceRequests.tools.')) && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-tools`}
              currentResourceRequests={request.originalData.resourceRequests.tools}
              requestedResourceRequests={request.decisionData.resourceRequests.tools}
              type="Tools"
              cluster={request.originalData.cluster}
            />
          )}
        </div>
      </>
    );
  }

  if (diffData.parentPaths.includes('webhookUrl')) {
    const noUrl = <span className="italic text-gray-400">No URL</span>;
    webhookUrlChange = (
      <>
        <Hr className="my-4" />
        <Heading className="text-lg mb-0 text-black">Webhook URL</Heading>
        <Text className="mt-1 mb-0 h-4">
          {request.originalData.webhookUrl || noUrl} &gt; {request.decisionData.webhookUrl || noUrl}
        </Text>
      </>
    );
  }

  return (
    <>
      {profileChange}
      {contactChange}
      {quotaChange}
      {webhookUrlChange}
    </>
  );
}
