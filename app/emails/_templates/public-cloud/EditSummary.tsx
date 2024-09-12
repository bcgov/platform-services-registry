import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import BudgetChanges from '@/emails/_components/Edit/BudgetChanges';
import ContactChanges from '@/emails/_components/Edit/ContactChanges';
import DescriptionChanges from '@/emails/_components/Edit/DescriptionChanges';
import { comparePublicCloudProjects } from '@/emails/_components/Edit/utils/compare-projects';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  comment?: string;
  userName: string;
}

export default function EditSummary({ request, comment, userName }: EmailProp) {
  if (!request || !request.project || !request.decisionData) return <></>;
  const current = request.project;
  const requested = request.decisionData;
  const changed = comparePublicCloudProjects(current, requested);

  return (
    <PublicCloudLayout requester={userName}>
      <Heading className="text-lg text-black">Your Edit Summary!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        You have edited your product {current.name} in the Public Cloud Landing Zone with the licence plate{' '}
        {request.licencePlate}. <br />
        <br /> You can see a summary of the changes below in this email, or click the button to view them in the Product
        Registry.
      </Text>
      <Button
        href={'https://registry.developer.gov.bc.ca/public-cloud/requests/all'}
        className="bg-bcorange rounded-md px-4 py-2 text-white"
      >
        View changes
      </Button>

      <Comment requestComment={request.requestComment} />

      {(changed.name || changed.description || changed.ministry) && (
        <>
          <Hr className="my-4" />
          <DescriptionChanges
            nameCurrent={current.name}
            descCurrent={current.description}
            ministryCurrent={current.ministry}
            nameRequested={requested.name}
            descRequested={requested.description}
            ministryRequested={requested.ministry}
            requestedLabel="Updated"
          />
        </>
      )}

      {(changed.projectOwnerId ||
        changed.primaryTechnicalLeadId ||
        changed.secondaryTechnicalLeadId ||
        changed.expenseAuthorityId) && (
        <>
          <Hr className="my-4" />
          <ContactChanges
            poCurrent={current.projectOwner}
            tl1Current={current.primaryTechnicalLead}
            tl2Current={current?.secondaryTechnicalLead}
            expenseAuthorityCurrent={current?.expenseAuthority}
            poRequested={requested.projectOwner}
            tl1Requested={requested.primaryTechnicalLead}
            tl2Requested={requested?.secondaryTechnicalLead}
            expenseAuthorityRequested={requested?.expenseAuthority}
            requestedLabel="Updated"
          />
        </>
      )}

      {(changed.accountCoding || changed.budget) && (
        <>
          <Hr className="my-4" />
          <BudgetChanges
            budgetCurrent={current.budget}
            budgetRequested={requested.budget}
            accountCodingCurrent={current.billing.accountCoding}
            accountCodingRequested={requested.billing.accountCoding}
          />
        </>
      )}
    </PublicCloudLayout>
  );
}
