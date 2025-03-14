import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
  requester: string;
}

export default function TeamRequestCancellation({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PrivateCloudLayout showFooter>
      <Heading className="text-lg">Request Cancellation: {request.decisionData.name}</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        The request for the project set <strong>{request.decisionData.name}</strong> on the Private Cloud OpenShift
        platform has been cancelled.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/decision`}>View Request</LinkButton>

      <p className="mt-8 text-[14px] italic">This request was cancelled by {requester}.</p>
    </PrivateCloudLayout>
  );
}
