import { Stepper, Popover, rem, HoverCard } from '@mantine/core';
import { IconCircleX, IconConfetti, IconCancel } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { searchPublicCloudBillings } from '@/services/backend/public-cloud/billings';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PublicCloudBillingSimpleDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import AutoResizeTextArea from './generic/input/AutoResizeTextArea';
import LoadingBox from './generic/LoadingBox';
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
    | 'type'
    | 'licencePlate'
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
  className?: string;
}) {
  const inEmouProcess = request.type === RequestType.CREATE && request.decisionStatus === DecisionStatus.PENDING;
  const { data: initialBillingSearch, isLoading: isBillingLoading } = useQuery({
    queryKey: ['request-billing', request.licencePlate],
    queryFn: () =>
      searchPublicCloudBillings({ licencePlate: request.licencePlate, page: 1, pageSize: 1, includeMetadata: false }),
    enabled: inEmouProcess,
  });

  if (inEmouProcess && isBillingLoading) {
    return (
      <LoadingBox isLoading>
        <Stepper active={2} iconSize={35}>
          <Stepper.Step />
          <Stepper.Step />
          <Stepper.Step />
        </Stepper>
      </LoadingBox>
    );
  }

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

  const getDecisionContent = (text: string) => (
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
      <div>{text}</div>
      <RequestDate date={request.decisionDate} />
    </DetailHoverCard>
  );

  const getCancellationContent = () => (
    <DetailHoverCard
      content={
        request.cancelledBy && (
          <div>
            <UserCard user={request.cancelledBy} />
          </div>
        )
      }
    >
      <div>Request cancelled</div>
      <RequestDate date={request.cancelledAt} />
    </DetailHoverCard>
  );

  let label = '';
  let description = '';

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      if (inEmouProcess && initialBillingSearch?.data.length) {
        const initialBilling = initialBillingSearch.data[0];

        if (!initialBilling.signed) {
          label = 'Billing Sign';
          description = 'Waiting on eMOU sign';
        } else if (!initialBilling.approved) {
          label = 'Billing Review';
          description = 'Waiting on eMOU review';
        } else {
          label = 'Review';
          description = 'Waiting on review';
        }
      }

      return (
        <Stepper active={2} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label={label} description={description} loading />
          <Stepper.Step label="Complete" description="Request provisioned" />
        </Stepper>
      );

    case DecisionStatus.APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label="Approve" description={getDecisionContent('Request approved')} />
          <Stepper.Step label="Complete" description="Provisioning request" loading />
        </Stepper>
      );

    case DecisionStatus.AUTO_APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step label="Auto-approve" description={getDecisionContent('Request auto-approved')} />
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
            description={getDecisionContent('Request rejected')}
          />
          <Stepper.Step
            label="Complete"
            color="gray"
            completedIcon={<IconCancel style={{ width: rem(20), height: rem(20) }} />}
            description="Request provisioned"
          />
        </Stepper>
      );

    case DecisionStatus.CANCELLED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step label="Submission" description={getSubmissionContent()} />
          <Stepper.Step
            label="Cancel"
            color="pink"
            completedIcon={<IconCircleX style={{ width: rem(20), height: rem(20) }} />}
            description={getCancellationContent()}
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
          {request.decisionMakerId ? (
            <Stepper.Step label="Approve" description={getDecisionContent('Request approved')} />
          ) : (
            <Stepper.Step label="Auto-approve" description={getDecisionContent('Request auto-approved')} />
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
