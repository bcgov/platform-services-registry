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

export default function AdminDeleteRequest({ request, userName }: EmailProp) {
  if (!request) return <></>;

  const decisionData = request.decisionData;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    provider,
    billing,
    budget,
    licencePlate,
    environmentsEnabled,
  } = decisionData;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout requester={userName}>
      <Heading className="text-lg">New Delete Request!</Heading>
      <Text>Hi Public Cloud Team, </Text>
      <Text>
        There is a new delete request for {name} that requires your attention. Log in to the Registry to review the
        details. If you have any questions about the request, the PO and TL contact details are included below and in
        the Registry.
      </Text>
      <Button
        href="https://registry.developer.gov.bc.ca/public-cloud/requests/all"
        className="bg-bcorange rounded-md px-4 py-2 text-white"
      >
        Review Request
      </Button>

      <Hr className="my-4" />

      <ProductDetails
        name={name}
        description={description}
        ministry={ministry}
        po={projectOwner}
        tl1={primaryTechnicalLead}
        tl2={secondaryTechnicalLead}
        expenseAuthority={expenseAuthority}
        licencePlate={licencePlate}
      />

      <Hr className="my-4" />

      <ProviderDetails
        provider={provider}
        accountCoding={accountCoding}
        budget={budget}
        environmentsEnabled={environmentsEnabled}
      />
    </PublicCloudLayout>
  );
}
