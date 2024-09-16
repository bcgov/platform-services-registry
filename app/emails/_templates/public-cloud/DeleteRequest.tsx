import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  userName: string;
}

export default function DeleteRequest({ request, userName }: EmailProp) {
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
      <Heading className="text-lg text-black">Your deletion request has been received!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We have received your deletion request for {name}. You will receive an email once your request has been
        processed and completed.
      </Text>

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
