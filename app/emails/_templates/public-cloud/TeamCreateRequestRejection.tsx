import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import ProductDetails from '../../_components/ProductDetails';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function TeamCreateRequestRejection({ request }: EmailProp) {
  if (!request) return <></>;

  const {
    name,
    description,
    ministry,
    provider,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
    budget,
    billing,
    environmentsEnabled,
  } = request.decisionData;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        Your request for the product {name} on the Public Cloud Landing Zone has been rejected due to the following
        reason(s):
      </Text>

      {request.decisionComment && <Text className="italic font-bold">{request.decisionComment}</Text>}

      <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

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

      <ProviderDetails
        provider={provider}
        accountCoding={accountCoding}
        budget={budget}
        environmentsEnabled={environmentsEnabled}
      />
    </PublicCloudLayout>
  );
}
