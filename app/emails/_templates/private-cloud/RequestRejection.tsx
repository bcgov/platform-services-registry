import { Prisma } from '@prisma/client';
import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import Comment from '@/emails/_components/Comment';
import QuotaChanges from '@/emails/_components/Edit/QuotaChanges';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { comparePrivateProductData } from '@/helpers/product-change';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
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
      <>
        <Hr className="my-4" />
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
      </>
    );
  }

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Sorry, your request was rejected</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        Your request regarding the product {currentData.name} on the Private Cloud Openshift platform has been rejected
        due to the following reason(s):
      </Text>
      <Comment decisionComment={request.decisionComment} />
      <Text>
        Here you can find request details&nbsp;
        <Link href={`${BASE_URL}/private-cloud/requests/${request.id}/decision`}>Request Info</Link>
      </Text>
      <Text>Log in to the registry and create a new request if the reason(s) above no longer apply.</Text>
      <Button href="https://registry.developer.gov.bc.ca/" className="bg-bcorange rounded-md px-4 py-2 text-white">
        Log in to Registry
      </Button>

      <Hr className="my-4" />

      <ProductDetails
        name={currentData.name}
        description={currentData.description}
        ministry={currentData.ministry}
        po={currentData.projectOwner}
        tl1={currentData.primaryTechnicalLead}
        tl2={currentData.secondaryTechnicalLead}
      />

      {changes}
    </PrivateCloudLayout>
  );
};

export default RequestRejectionTemplate;
