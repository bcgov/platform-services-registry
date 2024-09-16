import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import ProductDetails from '../../_components/ProductDetails';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

export default function RequestRejection({ request }: EmailProp) {
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
    licencePlate,
  } = decisionData;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        Your request for the product {name} on the Public Cloud Landing Zone has been rejected due to the following
        reason(s):
      </Text>
      <Comment decisionComment={request.decisionComment} />
      <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>
      <Button
        href="https://registry.developer.gov.bc.ca/public-cloud/requests/all"
        className="bg-bcorange rounded-md px-4 py-2 text-white"
      >
        Log in to Registry
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
    </PublicCloudLayout>
  );
}
