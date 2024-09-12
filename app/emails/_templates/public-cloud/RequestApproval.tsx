import { Link, Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
}

const RequestApprovalTemplate = ({ request }: EmailProp) => {
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
      <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        Your requested change for the project set for {name} on the Public Cloud Landing Zone {provider} is now
        complete. If you have any more questions, reach out to the Public cloud team in the Rocket.Chat channel&nbsp;
        <Link
          className="mt-0 h-4"
          href={`https://chat.developer.gov.bc.ca/group/${provider.toLowerCase()}-tenant-requests`}
        >
          #{provider.toLowerCase()}-tenant-requests
        </Link>
        .
      </Text>
      <Button
        href="https://registry.developer.gov.bc.ca/public-cloud/products/all"
        className="bg-bcorange rounded-md px-4 py-2 text-white"
      >
        Log in to Console
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

      <Comment decisionComment={request.decisionComment} />
    </PublicCloudLayout>
  );
};

export default RequestApprovalTemplate;
