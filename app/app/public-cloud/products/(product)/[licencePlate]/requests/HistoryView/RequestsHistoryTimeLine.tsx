'use client';

import { Timeline, Text, ThemeIcon } from '@mantine/core';
import { IconEdit, IconPlus, IconTrashX, IconSignature, IconFileCheck } from '@tabler/icons-react';
import _orderBy from 'lodash-es/orderBy';
import { ReactNode } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import TimeAgo from '@/components/generic/TimeAgo';
import UserCard from '@/components/UserCard';
import { RequestType } from '@/prisma/client';
import { PublicCloudBillingSimpleDecorated, PublicCloudRequestSimpleDecorated } from '@/types/public-cloud';
import RequestTimeLine from './RequestTimeLine';

function getBillingSigningContent({ billing }: { billing: PublicCloudBillingSimpleDecorated }) {
  if (billing.signed) {
    return (
      <div className="max-w-xl">
        <Text c="dimmed" size="sm" className="flex gap-1">
          <div>The billing has been signed</div>
          {billing.signedBy && (
            <>
              <span>by</span>
              <UserCard user={billing.signedBy} classNames={{ name: 'text-sm' }} />
            </>
          )}
        </Text>
        <TimeAgo date={billing.signedAt} />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The billing is awaiting signature</div>
        {billing.expenseAuthority && (
          <>
            <span>by</span>
            <UserCard user={billing.expenseAuthority} classNames={{ name: 'text-sm' }} />
          </>
        )}
      </Text>
    </div>
  );
}

function getBillingReviewContent({ billing }: { billing: PublicCloudBillingSimpleDecorated }) {
  if (billing.approved) {
    return (
      <div className="max-w-xl">
        <Text c="dimmed" size="sm" className="flex gap-1">
          <div>The billing has been approved</div>
          {billing.approvedBy && (
            <>
              <span>by</span>
              <UserCard user={billing.approvedBy} classNames={{ name: 'text-sm' }} />
            </>
          )}
        </Text>
        <TimeAgo date={billing.approvedAt} />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The billing is awaiting review</div>
      </Text>
    </div>
  );
}

export default function RequestsHistory({
  requests,
  billings,
}: {
  requests: PublicCloudRequestSimpleDecorated[];
  billings: PublicCloudBillingSimpleDecorated[];
}) {
  const orderedRequests = _orderBy(requests, 'createdAt', 'asc');
  const orderedBillings = _orderBy(billings, 'createdAt', 'asc');

  let billingInCreate: PublicCloudBillingSimpleDecorated | null = null;

  const hasBillings = orderedBillings.length > 0;
  const hasCreateRequest = orderedRequests.length > 0 && orderedRequests[0].type === RequestType.CREATE;

  if (hasCreateRequest && hasBillings) {
    const [createRequest] = orderedRequests;
    const [initialBilling] = orderedBillings;

    const isPendingDecision = !createRequest.decisionDate;
    const billingBeforeDecision = initialBilling.createdAt < createRequest.decisionDate!;

    if (isPendingDecision || billingBeforeDecision) {
      billingInCreate = initialBilling;
    }
  }

  return (
    <div className="flex justify-center items-center">
      <Timeline active={orderedRequests.length} color="green" bulletSize={28} lineWidth={3} className="max-w-3xl">
        {orderedRequests.map((request) => {
          let bullet!: ReactNode;
          if (request.type === RequestType.CREATE) bullet = <IconPlus size={18} />;
          else if (request.type === RequestType.EDIT) bullet = <IconEdit size={18} />;
          else if (request.type === RequestType.DELETE) bullet = <IconTrashX size={18} />;

          const preReviewSteps =
            request.type === RequestType.CREATE && billingInCreate ? (
              <>
                <Timeline.Item
                  title="Billing Sign"
                  color="purple"
                  bullet={
                    <ThemeIcon size={22} variant="gradient" gradient={{ from: 'purple', to: 'purple' }} radius="xl">
                      <IconSignature size={12} />
                    </ThemeIcon>
                  }
                  __lineActive
                >
                  {getBillingSigningContent({ billing: billingInCreate })}
                </Timeline.Item>
                <Timeline.Item
                  title="Billing Review"
                  color="purple"
                  bullet={
                    <ThemeIcon size={22} variant="gradient" gradient={{ from: 'purple', to: 'purple' }} radius="xl">
                      <IconFileCheck size={12} />
                    </ThemeIcon>
                  }
                  __lineActive
                >
                  {getBillingReviewContent({ billing: billingInCreate })}
                </Timeline.Item>
              </>
            ) : null;

          return (
            <Timeline.Item
              key={request.id}
              bullet={bullet}
              title={
                <div>
                  {request.type}
                  <ExternalLink href={`/public-cloud/requests/${request.id}/summary`} className="ml-2">
                    {request.id}
                  </ExternalLink>
                </div>
              }
            >
              <RequestTimeLine request={request} preReviewSteps={preReviewSteps} />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
