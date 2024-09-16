import { Heading, Text, Hr, Link, Button } from '@react-email/components';
import * as React from 'react';
import ClusterDetails from '@/emails/_components/ClusterDetails';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import Changes from '@/emails/_components/private-cloud/Changes';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetail;
}

export default function TeamEditRequestCompletion({ request }: EmailProp) {
  if (!request) return <></>;

  const { decisionData } = request;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Your edit request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        The project set edit request for {decisionData.name} has been successfully completed. You can now log in to{' '}
        <Link className="mt-0 h-4" href={`https://console.apps.${decisionData.cluster}.devops.gov.bc.ca/`}>
          OpenShift cluster console{' '}
        </Link>{' '}
        and you will see your new resource quota values.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <ProductDetails product={request.decisionData} />

      <ClusterDetails product={request.decisionData} showNamespaceInfo />

      <Changes request={request} />
    </PrivateCloudLayout>
  );
}
