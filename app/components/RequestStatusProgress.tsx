import { Stepper, Popover, rem, HoverCard } from '@mantine/core';
import { DecisionStatus } from '@prisma/client';
import { IconCircleX, IconConfetti, IconCancel } from '@tabler/icons-react';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { formatDate } from '@/utils/js';
import AutoResizeTextArea from './generic/input/AutoResizeTextArea';
import UserCard from './UserCard';

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

  return <div className="text-sm text-gray-400 mt-1">{formatDate(date)}</div>;
}

export default function RequestStatusProgress({
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
    | 'provisionedDate'
    | 'requestComment'
  >;
  className?: string;
}) {
  if (!request) return null;

  const getSubmissionContent = () => (
    <DetailHoverCard
      content={
        (request.createdBy || request.requestComment) && (
          <div>
            <UserCard user={request.createdBy} />
            <AutoResizeTextArea value={request.requestComment ?? ''} className="text-sm" />
          </div>
        )
      }
    >
      <div>Request submitted</div>
      <RequestDate date={request.createdAt} />
    </DetailHoverCard>
  );

  const getDecisionnContent = (text: string) => (
    <DetailHoverCard
      content={
        (request.decisionMaker || request.decisionComment) && (
          <div>
            <UserCard user={request.decisionMaker} />
            <AutoResizeTextArea value={request.decisionComment ?? ''} className="text-sm" />
          </div>
        )
      }
    >
      <div>Request submitted</div>
      <RequestDate date={request.decisionDate} />
    </DetailHoverCard>
  );

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      return (
        <Stepper active={2} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label="Review" description="Request on review" loading />
          <Stepper.Step label="Complete" description="Request provisioned" />
        </Stepper>
      );

    case DecisionStatus.APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label="Approve" description={getDecisionnContent('Request approved')} />
          <Stepper.Step label="Complete" description="Provisioning request" loading />
        </Stepper>
      );

    case DecisionStatus.AUTO_APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label="Auto-approve" description={getDecisionnContent('Request auto-approved')} />
          <Stepper.Step label="Complete" description="Provisioning request" loading />
        </Stepper>
      );

    case DecisionStatus.REJECTED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step
            label="Reject"
            color="danger"
            completedIcon={<IconCircleX style={{ width: rem(20), height: rem(20) }} />}
            description={getDecisionnContent('Request rejected')}
          />
          <Stepper.Step
            label="Complete"
            color="gray"
            completedIcon={<IconCancel style={{ width: rem(20), height: rem(20) }} />}
            description="Request provisioned"
          />
        </Stepper>
      );

    case DecisionStatus.PROVISIONED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          {request.decisionMakerEmail ? (
            <Stepper.Step label="Approve" description={getDecisionnContent('Request approved')} />
          ) : (
            <Stepper.Step label="Auto-approve" description={getDecisionnContent('Request auto-approved')} />
          )}
          <Stepper.Step
            label="Complete"
            color="success"
            completedIcon={<IconConfetti style={{ width: rem(20), height: rem(20) }} />}
            description={
              <div>
                <div>Request provisioned</div>
                <RequestDate date={request.provisionedDate} />
              </div>
            }
          />
        </Stepper>
      );
  }

  return null;
}
