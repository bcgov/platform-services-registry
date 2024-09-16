import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function TeamDeleteRequestRejection({ request }: EmailProp) {
  if (!request) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
    provider,
    budget,
    environmentsEnabled,
    billing,
  } = request.decisionData;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        Your delete request for the product {name} on the Public Cloud Landing Zone has been rejected due to the
        following reason(s):
      </Text>
      <Comment decisionComment={request.decisionComment} />
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
