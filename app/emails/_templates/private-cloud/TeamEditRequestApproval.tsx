import { Button, Heading, Text, Link, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import Comment from '@/emails/_components/Comment';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import Changes from '@/emails/_components/private-cloud/Changes';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
}

export default function TeamEditRequestApproval({ request }: EmailProp) {
  if (!request.originalData) return <></>;

  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg text-black">Success! Your edit request was approved!</Heading>
      <Text>Hi Product Team, </Text>
      <Text>
        We are pleased to inform you that your request for a resource quota has been approved on the Private Cloud
        OpenShift platform. Please allow 3-5 minutes for the request to be processed. If it takes longer, don&apos;t
        hesitate to reach out to us.
      </Text>
      <Text>
        If you have any more questions or need assistance, please reach out to the Platform Services team in the
        OpenShift-operations channel in the Microsoft Teams team: Developer Community.{' '}
        <Link className="mt-0 h-4" href={`https://teams.microsoft.com/l/channel/19%3A5d490d83b64448cfa4088bd951c1d0bc%40thread.tacv2/OpenShift-operations?groupId=a80418da-c27b-406e-89ab-7695b61924d8&tenantId=6fdb5200-3d0d-4a8a-b036-d3685e359adc`}>
          OpenShift-operations
        </Link>
        .
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <Comment decisionComment={request.decisionComment} />

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />

      <Changes request={request} />
    </PrivateCloudLayout>
  );
}
