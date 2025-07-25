import { Stepper, Timeline, Text, rem, HoverCard, Blockquote } from '@mantine/core';
import {
  IconCircleX,
  IconConfetti,
  IconCancel,
  IconInfoCircle,
  IconChecklist,
  IconFileAnalytics,
  IconLoader,
} from '@tabler/icons-react';
import React from 'react';
import TimeAgo from '@/components/generic/TimeAgo';
import UserCard from '@/components/UserCard';
import { DecisionStatus } from '@/prisma/client';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

export default function RequestTimeLine({
  request,
  preReviewSteps,
  className,
}: {
  request: Pick<
    PublicCloudRequestDetail,
    | 'decisionMakerId'
    | 'decisionMaker'
    | 'decisionStatus'
    | 'decisionDate'
    | 'decisionComment'
    | 'createdById'
    | 'createdBy'
    | 'createdAt'
    | 'cancelledAt'
    | 'cancelledById'
    | 'cancelledBy'
    | 'provisionedDate'
    | 'requestComment'
  >;
  preReviewSteps?: React.ReactNode | null;
  className?: string;
}) {
  if (!request) return null;

  const getSubmissionContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <span>The request has been submitted by</span>
        <UserCard user={request.createdBy} classNames={{ name: 'text-sm' }} />
      </Text>
      {request.requestComment && (
        <Blockquote color="blue" className="mt-0 p-2 italic text-sm max-w-lg">
          {request.requestComment}
        </Blockquote>
      )}
      <TimeAgo date={request.createdAt} />
    </div>
  );

  const getDecisionContent = (decision: DecisionStatus) => {
    let text = 'reviewed';
    if (decision === DecisionStatus.APPROVED) text = 'approved';
    else if (decision === DecisionStatus.REJECTED) text = 'rejected';
    else if (decision === DecisionStatus.AUTO_APPROVED) text = 'auto-approved';

    return (
      <div className="max-w-xl">
        <Text c="dimmed" size="sm" className="flex gap-1">
          <div>The request has been {text}</div>
          {request.decisionMaker && (
            <>
              <span>by</span>
              <UserCard user={request.decisionMaker} classNames={{ name: 'text-sm' }} />
            </>
          )}
        </Text>
        {request.decisionComment && (
          <Blockquote color="green" className="mt-0 p-2 italic text-sm max-w-lg">
            {request.decisionComment}
          </Blockquote>
        )}
        <TimeAgo date={request.decisionDate} />
      </div>
    );
  };

  const getCancellationContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request has been cancelled</div>
        {request.cancelledBy && (
          <>
            <span>by</span>
            <UserCard user={request.cancelledBy} classNames={{ name: 'text-sm' }} />
          </>
        )}
      </Text>
      <TimeAgo date={request.cancelledAt} />
    </div>
  );

  const getProvisionContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request has been provisioned</div>
      </Text>
      <TimeAgo date={request.provisionedDate} />
    </div>
  );

  const getProvisioningContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request is being provisioned</div>
      </Text>
    </div>
  );

  const getReviewContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request is being reviewed</div>
      </Text>
    </div>
  );

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      return (
        <Timeline active={0} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Review" bullet={<IconCancel size={12} />}>
            {getReviewContent()}
          </Timeline.Item>
        </Timeline>
      );

    case DecisionStatus.APPROVED:
      return (
        <Timeline active={1} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Approve" bullet={<IconCancel size={12} />}>
            {getDecisionContent(DecisionStatus.APPROVED)}
          </Timeline.Item>
          <Timeline.Item title="Provision" bullet={<IconLoader size={12} />}>
            {getProvisioningContent()}
          </Timeline.Item>
        </Timeline>
      );

    case DecisionStatus.AUTO_APPROVED:
      return (
        <Timeline active={1} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Auto-approval" bullet={<IconCancel size={12} />}>
            {getDecisionContent(DecisionStatus.AUTO_APPROVED)}
          </Timeline.Item>
          <Timeline.Item title="Provision" bullet={<IconLoader size={12} />}>
            {getProvisioningContent()}
          </Timeline.Item>
        </Timeline>
      );

    case DecisionStatus.REJECTED:
      return (
        <Timeline active={3} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Rejection" bullet={<IconCancel size={12} />}>
            {getDecisionContent(DecisionStatus.REJECTED)}
          </Timeline.Item>
        </Timeline>
      );

    case DecisionStatus.CANCELLED:
      return (
        <Timeline active={3} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Cancellation" bullet={<IconCancel size={12} />}>
            {getCancellationContent()}
          </Timeline.Item>
        </Timeline>
      );

    case DecisionStatus.PROVISIONED:
      return (
        <Timeline active={3} bulletSize={20} lineWidth={2} className="w-full">
          <Timeline.Item title="Submission" bullet={<IconFileAnalytics size={12} />}>
            {getSubmissionContent()}
          </Timeline.Item>
          {preReviewSteps}
          <Timeline.Item title="Review" bullet={<IconChecklist size={12} />}>
            {getDecisionContent(request.decisionMakerId ? DecisionStatus.APPROVED : DecisionStatus.AUTO_APPROVED)}
          </Timeline.Item>
          <Timeline.Item title="Completion" bullet={<IconConfetti size={12} />}>
            {getProvisionContent()}
          </Timeline.Item>
        </Timeline>
      );
  }

  return null;
}
