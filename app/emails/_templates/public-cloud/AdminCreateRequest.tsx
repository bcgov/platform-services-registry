import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  requester: string;
}

export default function AdminCreateRequest({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PublicCloudLayout requester={requester}>
      <Heading className="text-lg">New Request!</Heading>
      <Text>Hi Public Cloud Team,</Text>
      <Text>
        There is a new request for {request.decisionData.name} that requires your review. Log in to the Registry to
        review the details. If you have any questions about the request, the PO and TL contact details are included
        below and in the Registry
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>Review Request</LinkButton>

      <ProductDetails
        name={request.decisionData.name}
        description={request.decisionData.description}
        ministry={request.decisionData.ministry}
        po={request.decisionData.projectOwner}
        tl1={request.decisionData.primaryTechnicalLead}
        tl2={request.decisionData.secondaryTechnicalLead}
        expenseAuthority={request.decisionData.expenseAuthority}
        licencePlate={request.decisionData.licencePlate}
      />

      <ProviderDetails
        provider={request.decisionData.provider}
        accountCoding={request.decisionData.billing.accountCoding}
        budget={request.decisionData.budget}
        environmentsEnabled={request.decisionData.environmentsEnabled}
      />
    </PublicCloudLayout>
  );
}
