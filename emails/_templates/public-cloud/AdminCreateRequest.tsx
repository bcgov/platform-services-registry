import * as React from 'react';
import { Button, Heading, Text } from '@react-email/components';
import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import ProductDetails from '@/emails/_components/ProductDetails';
import ProviderDetails from '@/emails/_components/ProviderDetails';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';

interface EmailProp {
  request: PublicCloudRequestWithRequestedProject;
}

export default function AdminCreateRequest({ request }: EmailProp) {
  if (!request) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">New Request!</Heading>
        <Text>Hi Public Cloud Team, </Text>
        <Text className="">
          There is a new request that requires your review. Log in to the Registry to review the details. If you have
          any questions about the request, the PO and TL contact details are included below and in the Registry
        </Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Review Request
        </Button>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={request.requestedProject.name}
          description={request.requestedProject.description}
          ministry={request.requestedProject.ministry}
          po={request.requestedProject.projectOwner}
          tl1={request.requestedProject.primaryTechnicalLead}
          tl2={request.requestedProject.secondaryTechnicalLead}
          expenseAuthority={request.requestedProject.expenseAuthority}
          licencePlate={request.requestedProject.licencePlate}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProviderDetails
          provider={request.requestedProject.provider}
          accountCoding={request.requestedProject.accountCoding}
          budget={request.requestedProject.budget}
        />
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
}
