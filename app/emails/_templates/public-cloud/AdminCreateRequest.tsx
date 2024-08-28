import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetail;
  userName: string;
}

export default function AdminCreateRequest({ request, userName }: EmailProp) {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">New Request!</Heading>
        <Text>Hi Public Cloud Team, </Text>
        <Text className="">
          There is a new request for {request.decisionData.name} that requires your review. Log in to the Registry to
          review the details. If you have any questions about the request, the PO and TL contact details are included
          below and in the Registry
        </Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Review Request
        </Button>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={request.decisionData.name}
          description={request.decisionData.description}
          ministry={request.decisionData.ministry}
          po={request.decisionData.projectOwner}
          tl1={request.decisionData.primaryTechnicalLead}
          tl2={request.decisionData.secondaryTechnicalLead}
          expenseAuthority={request.decisionData.expenseAuthority}
          licencePlate={request.decisionData.licencePlate}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProviderDetails
          provider={request.decisionData.provider}
          accountCoding={request.decisionData.billing.accountCoding}
          budget={request.decisionData.budget}
          environmentsEnabled={request.decisionData.environmentsEnabled}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Text>This create request was actioned by {userName}.</Text>
      </div>
    </Layout>
  );
}
