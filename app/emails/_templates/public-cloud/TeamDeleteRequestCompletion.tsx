import { Link, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetailDecorated;
}

export default function TeamDeleteRequestCompletion({ request }: EmailProp) {
  const { name, provider } = request.decisionData;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg text-black">Success! Your request was completed!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        Your request for your product {name} on the Public Cloud platform is complete. If you have any more questions,
        reach out to the Public Cloud team in the Rocket.Chat channel&nbsp;
        <Link
          className="mt-0 h-4"
          href={`https://chat.developer.gov.bc.ca/group/${provider.toLowerCase()}-tenant-requests`}
        >
          #{provider.toLowerCase()}-tenant-requests
        </Link>
        .
      </Text>
      <Text>
        The Product Owner and the Technical Lead(s) are granted access to the registry and can login to the registry now
        and manage users with product set roles.
      </Text>
      <Text>
        Removing a Product Owner or Technical Lead(s) as project contacts in the Platform Product Registry will revoke
        their access to the Registry. The newly added Product Owner Technical Lead(s) on the product details page will
        then gain access to the registry and can manage access to the project set accounts in {provider}.
      </Text>
      {provider === 'AZURE' && (
        <Text>
          Your project in Azure will automatically be added to the Enterprise Support Plan (&quot;Unified&quot;) that BC
          Government has procured with Microsoft. Please wait 7 business days after your project has been provisioned,
          before attempting to open a case with the Microsoft support team through the Azure Portal. The instructions on
          how to open a support case are available here. If you need to open a support case before the access to the
          Enterprise Support Plan is enabled for your project, please contact BC Gov&apos;s account representative
          <Link className="mt-0 h-4" href={`mailto:BHASKAR.HALDER@microsoft.com`}>
            BHASKAR.HALDER@microsoft.com
          </Link>
          and he will be able to assist you with this.
        </Text>
      )}

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ProviderDetails product={request.decisionData} />
    </PublicCloudLayout>
  );
}
