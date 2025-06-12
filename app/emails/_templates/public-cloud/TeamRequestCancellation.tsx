import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import Comment from '@/emails/_components/Comment';
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
        The {request.type} request for the project set <strong>{request.decisionData.name}</strong> on the Public Cloud
        Landing Zone has been cancelled.
      </Text>

      <LinkButton href={`/public-cloud/requests/${request.id}/request`}>View Request</LinkButton>
      <Comment decisionComment={request.decisionComment} />
      <p className="mt-8 text-[14px] italic">This request was cancelled by {requester}.</p>
    </PublicCloudLayout>
  );
}
