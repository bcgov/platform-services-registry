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
import AutoResizeTextArea from '@/components/generic/input/AutoResizeTextArea';
import UserCard from '@/components/UserCard';
import { DecisionStatus } from '@/prisma/client';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { formatDate } from '@/utils/js';

function timeAgo(date: string | Date): string {
  if (!date) return '';

  const tdate = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - tdate.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  if (years === 0) {
    return '1 year ago';
  }

  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function DetailHoverCard({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <HoverCard width={280} shadow="md">
      <HoverCard.Target>
        <div>{children}</div>
      </HoverCard.Target>
      {content && <HoverCard.Dropdown>{content}</HoverCard.Dropdown>}
    </HoverCard>
  );
}

function RequestDate({ date }: { date?: Date | null }) {
  if (!date) return null;

  return <div className="text-sm text-gray-400 mt-1">{timeAgo(date)}</div>;
}

export default function RequestTimeLine({
  request,
  className,
}: {
  request: Pick<
    PrivateCloudRequestDetail,
    | 'decisionMakerEmail'
    | 'decisionMaker'
    | 'decisionStatus'
    | 'decisionDate'
    | 'decisionComment'
    | 'createdByEmail'
    | 'createdBy'
    | 'createdAt'
    | 'cancelledAt'
    | 'cancelledById'
    | 'cancelledBy'
    | 'provisionedDate'
    | 'requestComment'
  >;
  className?: string;
}) {
  if (!request) return null;

  const getSubmissionContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request has been submitted by</div>
        <UserCard user={request.createdBy} classNames={{ name: 'text-sm' }} />
      </Text>
      {request.requestComment && (
        <Blockquote color="blue" className="mt-0 p-2 italic text-sm max-w-lg">
          {request.requestComment}
        </Blockquote>
      )}
      <Text size="xs" mt={4}>
        {timeAgo(request.createdAt)}
      </Text>
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
        {request.decisionDate && (
          <Text size="xs" mt={4}>
            {timeAgo(request.decisionDate)}
          </Text>
        )}
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
      {request.cancelledAt && (
        <Text size="xs" mt={4}>
          {timeAgo(request.cancelledAt)}
        </Text>
      )}
    </div>
  );

  const getProvisionContent = () => (
    <div className="max-w-xl">
      <Text c="dimmed" size="sm" className="flex gap-1">
        <div>The request has been provisioned</div>
      </Text>
      {request.provisionedDate && (
        <Text size="xs" mt={4}>
          {timeAgo(request.provisionedDate)}
        </Text>
      )}
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
          <Timeline.Item title="Review" bullet={<IconChecklist size={12} />}>
            {getDecisionContent(request.decisionMakerEmail ? DecisionStatus.APPROVED : DecisionStatus.AUTO_APPROVED)}
          </Timeline.Item>
          <Timeline.Item title="Completion" bullet={<IconConfetti size={12} />}>
            {getProvisionContent()}
          </Timeline.Item>
        </Timeline>
      );
  }

  return null;
}
