import { Stepper, rem } from '@mantine/core';
import { DecisionStatus } from '@prisma/client';
import { IconCircleX, IconConfetti } from '@tabler/icons-react';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { formatDate } from '@/utils/date';

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
    'decisionMakerEmail' | 'decisionStatus' | 'createdAt' | 'decisionDate' | 'provisionedDate'
  >;
  className?: string;
}) {
  if (!request) return null;

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      return (
        <Stepper active={2} iconSize={35}>
          <Stepper.Step
            label="Submission"
            description={
              <div>
                <div>Request submitted</div>
                <RequestDate date={request.createdAt} />
              </div>
            }
          />
          <Stepper.Step label="Review" description="Request on review" loading />
          <Stepper.Step label="Complete" description="Request provisioned" />
        </Stepper>
      );

    case DecisionStatus.APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step
            label="Submission"
            description={
              <div>
                <div>Request submitted</div>
                <RequestDate date={request.createdAt} />
              </div>
            }
          />
          <Stepper.Step
            label="Approve"
            description={
              <div>
                <div>Request approved</div>
                <RequestDate date={request.decisionDate} />
              </div>
            }
          />
          <Stepper.Step label="Complete" description="Provisioning request" loading />
        </Stepper>
      );

    case DecisionStatus.AUTO_APPROVED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step
            label="Submission"
            description={
              <div>
                <div>Request submitted</div>
                <RequestDate date={request.createdAt} />
              </div>
            }
          />
          <Stepper.Step
            label="Auto-approve"
            description={
              <div>
                <div>Request auto-approved</div>
                <RequestDate date={request.decisionDate} />
              </div>
            }
          />
          <Stepper.Step label="Complete" description="Provisioning request" loading />
        </Stepper>
      );

    case DecisionStatus.REJECTED:
      return (
        <Stepper active={2} iconSize={35}>
          <Stepper.Step
            label="Submission"
            description={
              <div>
                <div>Request submitted</div>
                <RequestDate date={request.createdAt} />
              </div>
            }
          />
          <Stepper.Step
            label="Reject"
            color="danger"
            completedIcon={<IconCircleX style={{ width: rem(20), height: rem(20) }} />}
            description={
              <div>
                <div>Request rejected</div>
                <RequestDate date={request.decisionDate} />
              </div>
            }
          />
          <Stepper.Step label="Complete" color="gray" description="Request provisioned" />
        </Stepper>
      );

    case DecisionStatus.PROVISIONED:
      return (
        <Stepper active={3} iconSize={35}>
          <Stepper.Step
            label="Submission"
            description={
              <div>
                <div>Request submitted</div>
                <RequestDate date={request.createdAt} />
              </div>
            }
          />
          {request.decisionMakerEmail ? (
            <Stepper.Step
              label="Approve"
              description={
                <div>
                  <div>Request approved</div>
                  <RequestDate date={request.decisionDate} />
                </div>
              }
            />
          ) : (
            <Stepper.Step
              label="Auto-approve"
              description={
                <div>
                  <div>Request auto-approved</div>
                  <RequestDate date={request.decisionDate} />
                </div>
              }
            />
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
