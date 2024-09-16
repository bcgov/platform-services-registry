import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import Changes from '@/emails/_components/private-cloud/Changes';
import ProductDetails from '@/emails/_components/ProductDetails';
import { isQuotaUpgrade } from '@/helpers/auto-approval-check';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
  requester: string;
}

export default function TeamEditRequest({ request, requester }: EmailProp) {
  if (!request.originalData) return <></>;

  const requestedQuota = {
    testQuota: request.originalData.testQuota,
    toolsQuota: request.originalData.toolsQuota,
    developmentQuota: request.originalData.developmentQuota,
    productionQuota: request.originalData.productionQuota,
  };

  const currentQuota = {
    testQuota: request.decisionData.testQuota,
    toolsQuota: request.decisionData.toolsQuota,
    developmentQuota: request.decisionData.developmentQuota,
    productionQuota: request.decisionData.productionQuota,
  };

  const isQuotaUpgraded = isQuotaUpgrade(currentQuota, requestedQuota);

  return (
    <PrivateCloudLayout requester={requester}>
      <Heading className="text-lg text-black">New edit product request!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        You have submitted an edit request for your product with the licence plate {request.licencePlate}.
        {isQuotaUpgraded
          ? ' Our administrators have been notified and will review your request.'
          : ' Your request will be reviewed automatically. Once the provisioning is complete, you will receive a notification email with all the relevant details and updates regarding your request.'}
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment requestComment={request.requestComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />

      <Changes request={request} />
    </PrivateCloudLayout>
  );
}
