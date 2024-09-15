import { Link, Button, Heading, Text, Hr } from '@react-email/components';
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

export default function TeamCreateRequestApproval({ request }: EmailProp) {
  if (!request) return <></>;

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
  } = request.decisionData;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">Success! Your create request was approved!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We are pleased to inform you that your request to create the product {request.decisionData.name} has been
        approved on the Public Cloud Landing Zone {provider}. Please allow 3-5 minutes for the request to be processed.
        If it takes longer, don&apos;t hesitate to reach out to us.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Public cloud team in the Rocket.Chat
        channel&nbsp;
        <Link
          className="mt-0 h-4"
          href={`https://chat.developer.gov.bc.ca/group/${provider.toLowerCase()}-tenant-requests`}
        >
          #{provider.toLowerCase()}-tenant-requests
        </Link>
        .
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <Comment decisionComment={request.decisionComment} />

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
