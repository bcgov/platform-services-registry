import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import PublicCloudLayout from '@/emails/_components/layout/PublicCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

interface EmailProp {
  request: PublicCloudRequestDetailDecorated;
  requester: string;
}

export default function TeamRequestCancellation({ request, requester }: EmailProp) {
  if (!request) return <></>;

  return (
    <PublicCloudLayout showFooter>
      <Heading className="text-lg">Request Cancellation: {request.decisionData.name}</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        The request for the project set <strong>{request.decisionData.name}</strong> on the Public Cloud Landing Zone
        has been cancelled.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>

      <p className="mt-8 text-[14px] italic">This request was cancelled by {requester}.</p>
    </PublicCloudLayout>
  );
}
