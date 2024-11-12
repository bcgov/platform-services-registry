import { Button, Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import LinkButton from '@/emails/_components/LinkButton';
import Changes from '@/emails/_components/private-cloud/Changes';
import QuotaUpgradeResources from '@/emails/_components/private-cloud/QuotaUpgradeResources';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface EmailProp {
  request: PrivateCloudRequestDetailDecorated;
  requester: string;
}

export default function AdminEditRequestQuotaAutoApproval({ request, requester }: EmailProp) {
  if (!request.originalData) return <></>;

  return (
    <PrivateCloudLayout requester={requester}>
      <Heading className="text-lg">Quota Upgrade Auto-Approval</Heading>
      <Text>Hi Registry Team,</Text>
      <Text>
        There is a new request that has Quota upgrade changes and auto-approved. Log in to the Registry to review the
        details.
      </Text>

      <LinkButton href={`/private-cloud/requests/${request.id}/summary`}>Review Request</LinkButton>

      <QuotaUpgradeResources resourceDetailList={request.quotaUpgradeResourceDetailList} />
      <Changes request={request} />
    </PrivateCloudLayout>
  );
}
