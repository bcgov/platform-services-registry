import { Heading, Link, Text, Hr } from '@react-email/components';
import ContactChanges from '@/emails/_components/ContactChanges';
import DescriptionChanges from '@/emails/_components/DescriptionChanges';
import QuotaChanges from '@/emails/_components/QuotaChanges';
import { comparePrivateProductData } from '@/helpers/product-change';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export default function Changes({ request }: { request: PrivateCloudRequestDetail }) {
  if (!request.originalData) return null;

  const diffData = comparePrivateProductData(request.originalData, request.decisionData);

  let profileChange = null;
  let contactChange = null;
  let quotaChange = null;

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
          {diffData.parentPaths.includes('productionQuota') && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-prod`}
              quotaCurrent={request.originalData.productionQuota}
              quotaRequested={request.decisionData.productionQuota}
              type="Production"
              cluster={request.originalData.cluster}
              currentLabel="Current"
              requestedLabel="Requested"
            />
          )}
          {diffData.parentPaths.includes('testQuota') && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-test`}
              quotaCurrent={request.originalData.testQuota}
              quotaRequested={request.decisionData.testQuota}
              type="Test"
              cluster={request.originalData.cluster}
              currentLabel="Current"
              requestedLabel="Requested"
            />
          )}
          {diffData.parentPaths.includes('developmentQuota') && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-dev`}
              quotaCurrent={request.originalData.developmentQuota}
              quotaRequested={request.decisionData.developmentQuota}
              type="Development"
              cluster={request.originalData.cluster}
              currentLabel="Current"
              requestedLabel="Requested"
            />
          )}
          {diffData.parentPaths.includes('toolsQuota') && (
            <QuotaChanges
              licencePlate={`${request.licencePlate}-tools`}
              quotaCurrent={request.originalData.toolsQuota}
              quotaRequested={request.decisionData.toolsQuota}
              type="Tools"
              cluster={request.originalData.cluster}
              currentLabel="Current"
              requestedLabel="Requested"
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {profileChange}
      {contactChange}
      {quotaChange}
    </>
  );
}
