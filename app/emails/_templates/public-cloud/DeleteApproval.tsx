import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const DeleteApprovalTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

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
  } = product;

  const { accountCoding } = billing;

  return (
    <PublicCloudLayout>
      <Heading className="text-lg text-black">
        Your deletion request has been sent to our platform administrators!
      </Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        We acknowledge the receipt of your deletion request for {name} project set. This request has been communicated
        to our platform administrators, who will take the necessary actions to delete the specified project set.
      </Text>
      <Text>
        Please be informed that until the deletion process is completed, the project set will continue to incur charges
        for the utilized resources. We are committed to processing your request promptly to minimize any additional
        expenses.
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
};

export default DeleteApprovalTemplate;
