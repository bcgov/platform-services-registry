import { Heading, Link, Text, Hr } from '@react-email/components';
import { ReactNode } from 'react';
import BudgetChanges from '@/emails/_components/BudgetChanges';
import ContactChanges from '@/emails/_components/ContactChanges';
import DescriptionChanges from '@/emails/_components/DescriptionChanges';
import MemberChanges from '@/emails/_components/MemberChanges';
import { comparePublicProductData } from '@/helpers/product-change';
import { PublicCloudRequestDetail, PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

export default function Changes({ request }: { request: PublicCloudRequestDetailDecorated }) {
  if (!request.originalData) return null;

  const diffData = comparePublicProductData(request.originalData, request.decisionData);

  let profileChange: ReactNode = null;
  let contactChange: ReactNode = null;
  let membersChange: ReactNode = null;
  let budgetChange: ReactNode = null;

  if (diffData.profileChanged) {
    profileChange = (
      <>
        <Hr className="my-4" />
        <DescriptionChanges
          nameCurrent={request.originalData.name}
          descCurrent={request.originalData.description}
          ministryCurrent={request.originalData.organization}
          nameRequested={request.decisionData.name}
          descRequested={request.decisionData.description}
          ministryRequested={request.decisionData.organization}
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

  if (diffData.budgetChanged) {
    budgetChange = (
      <>
        <Hr className="my-4" />
        <BudgetChanges budgetCurrent={request.originalData.budget} budgetRequested={request.decisionData.budget} />
      </>
    );
  }

  return (
    <>
      {profileChange}
      {contactChange}
      {membersChange}
      {budgetChange}
    </>
  );
}
