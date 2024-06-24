import { Prisma } from '@prisma/client';
import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Comment from '@/emails/_components/Comment';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { comparePrivateProductData } from '@/helpers/product-change';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';

interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
  currentData: Prisma.PrivateCloudRequestedProjectGetPayload<{
    include: {
      projectOwner: true;
      primaryTechnicalLead: true;
      secondaryTechnicalLead: true;
    };
  }>;
}

const RequestRejectionTemplate = ({ request, currentData }: EmailProp) => {
  if (!request) return <></>;

  let changes = null;
  if (request.type === 'EDIT' && request.originalData) {
    const diffData = comparePrivateProductData(request.originalData, request.decisionData);
    changes = (
      <div className="flex flex-row flex-wrap">
        {diffData.parentPaths.includes('productionQuota') && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-prod`}
            quotaCurrent={request.originalData.productionQuota}
            quotaRequested={request.decisionData.productionQuota}
            type="Production"
            cluster={currentData.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {diffData.parentPaths.includes('testQuota') && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-test`}
            quotaCurrent={request.originalData.testQuota}
            quotaRequested={request.decisionData.testQuota}
            type="Test"
            cluster={currentData.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {diffData.parentPaths.includes('developmentQuota') && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-dev`}
            quotaCurrent={request.originalData.developmentQuota}
            quotaRequested={request.decisionData.developmentQuota}
            type="Development"
            cluster={currentData.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
        {diffData.parentPaths.includes('toolsQuota') && (
          <QuotaChanges
            licencePlate={`${request.licencePlate}-tools`}
            quotaCurrent={request.originalData.toolsQuota}
            quotaRequested={request.decisionData.toolsQuota}
            type="Tools"
            cluster={currentData.cluster}
            currentLabel="Current"
            requestedLabel="Rejected"
          />
        )}
      </div>
    );
  }

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
        <Text>Hi Product Team, </Text>
        <Text className="">
          Your request regarding the product {currentData.name} on the Private Cloud Openshift platform has been
          rejected due to the following reason(s):
        </Text>
        <Comment decisionComment={request.decisionComment} />
        <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>
        <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
          Log in to Registry
        </Button>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={currentData.name}
          description={currentData.description}
          ministry={currentData.ministry}
          po={currentData.projectOwner}
          tl1={currentData.primaryTechnicalLead}
          tl2={currentData.secondaryTechnicalLead}
        />
      </div>

      {changes}

      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default RequestRejectionTemplate;
