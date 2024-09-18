import { Heading, Link, Text, Hr } from '@react-email/components';
import BudgetChanges from '@/emails/_components/BudgetChanges';
import ContactChanges from '@/emails/_components/ContactChanges';
import DescriptionChanges from '@/emails/_components/DescriptionChanges';
import { comparePublicProductData } from '@/helpers/product-change';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

export default function Changes({ request }: { request: PublicCloudRequestDetail }) {
  if (!request.originalData) return null;

  const diffData = comparePublicProductData(request.originalData, request.decisionData);

  let profileChange = null;
  let contactChange = null;
  let billingChange = null;

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
          expenseAuthorityCurrent={request.originalData.expenseAuthority}
          poRequested={request.decisionData.projectOwner}
          tl1Requested={request.decisionData.primaryTechnicalLead}
          tl2Requested={request.decisionData.secondaryTechnicalLead}
          expenseAuthorityRequested={request.decisionData.expenseAuthority}
          requestedLabel="Updated"
        />
      </>
    );
  }

  if (diffData.billingChanged || diffData.budgetChanged) {
    billingChange = (
      <>
        <Hr className="my-4" />
        <BudgetChanges
          budgetCurrent={request.originalData.budget}
          budgetRequested={request.decisionData.budget}
          accountCodingCurrent={request.originalData.billing.accountCoding}
          accountCodingRequested={request.decisionData.billing.accountCoding}
        />
      </>
    );
  }

  return (
    <>
      {profileChange}
      {contactChange}
      {billingChange}
    </>
  );
}
