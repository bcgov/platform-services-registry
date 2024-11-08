import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
}

export default function TeamDeleteRequestCompletion({ request }: EmailProp) {
  if (!request) return <></>;

  const { decisionData } = request;

  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg text-black">Your deletion request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>{`The project set deletion for ${decisionData.name} has been successfully completed.`}</Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />
    </PrivateCloudLayout>
  );
}
