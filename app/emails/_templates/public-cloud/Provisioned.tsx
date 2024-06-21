import { Link, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const ProvisionedTemplate = ({ product }: EmailProp) => {
  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    provider,
    accountCoding,
    budget,
    licencePlate,
    environmentsEnabled,
  } = product;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Success! Your request was approved and completed!</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your request for your product {name} on the Public Cloud platform is complete. If you have any more questions,
          reach out to the Public Cloud team in the Rocket.Chat channel
          <Link
            className="mt-0 h-4"
            href={`https://chat.developer.gov.bc.ca/group/${provider.toLowerCase()}-tenant-requests`}
          >
            {` #${provider.toLowerCase()}-tenant-requests`}
          </Link>
          .
        </Text>
        <Text className="">
          The Product Owner and the Technical Lead(s) are granted access to the registry and can login to the registry
          now and manage users with product set roles.
        </Text>
        <Text className="">
          Removing a Product Owner or Technical Lead(s) as project contacts in the Platform Product Registry will revoke
          their access to the Registry. The newly added Product Owner Technical Lead(s) on the product details page will
          then gain access to the registry and can manage access to the project set accounts in {provider}.
        </Text>
        {provider === 'AZURE' && (
          <Text className="">
            Your project in Azure will automatically be added to the Enterprise Support Plan (&quot;Unified&quot;) that
            BC Government has procured with Microsoft. Please wait 7 business days after your project has been
            provisioned, before attempting to open a case with the Microsoft support team through the Azure Portal. The
            instructions on how to open a support case are available here. If you need to open a support case before the
            access to the Enterprise Support Plan is enabled for your project, please contact BC Gov&apos;s account
            representative
            <Link className="mt-0 h-4" href={`mailto:BHASKAR.HALDER@microsoft.com`}>
              BHASKAR.HALDER@microsoft.com
            </Link>
            and he will be able to assist you with this.
          </Text>
        )}
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
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
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProviderDetails
          provider={provider}
          accountCoding={accountCoding}
          budget={budget}
          environmentsEnabled={environmentsEnabled}
        />
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
};

export default ProvisionedTemplate;
