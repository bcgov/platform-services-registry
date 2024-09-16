import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  userName: string;
}

export default function AdminCreateRequest({ request, userName }: EmailProp) {
  if (!request) return <></>;

  return (
    <PublicCloudLayout requester={userName}>
      <Heading className="text-lg">New Request!</Heading>
      <Text>Hi Public Cloud Team, </Text>
      <Text>
        There is a new request for {request.decisionData.name} that requires your review. Log in to the Registry to
        review the details. If you have any questions about the request, the PO and TL contact details are included
        below and in the Registry
      </Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        Review Request
      </Button>

      <Hr className="my-4" />

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

      <Hr className="my-4" />

      <ProviderDetails
        provider={request.decisionData.provider}
        accountCoding={request.decisionData.billing.accountCoding}
        budget={request.decisionData.budget}
        environmentsEnabled={request.decisionData.environmentsEnabled}
      />
    </PublicCloudLayout>
  );
}
