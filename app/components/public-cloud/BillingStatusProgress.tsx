import { Button, Stepper, rem } from '@mantine/core';
import { IconConfetti } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { openPublicCloudMouReviewModal } from '@/components/modal/publicCloudMouReview';
import { openPublicCloudMouSignModal } from '@/components/modal/publicCloudMouSign';
import UserProfile from '@/components/users/UserProfile';
import { getPublicCloudEmouFileName } from '@/helpers/emou';
import { Provider, TaskStatus, TaskType } from '@/prisma/client';
import { downloadPublicCloudBillingPDF } from '@/services/backend/public-cloud/billings';
import { sendTaskEmail as _sendTaskEmail } from '@/services/backend/tasks';
import { useUserState } from '@/states/user';
import { PublicCloudBillingDetailDecorated, PublicCloudBillingSearchResponseMetadataTask } from '@/types/public-cloud';
import { cn, formatDate } from '@/utils/js';

function BillingDate({ date }: { date?: Date | null }) {
  if (!date) return null;

  return <div className="text-sm text-gray-400 mt-1">{formatDate(date)}</div>;
}

export default function BillingStatusProgress({
  billing,
  data,
  task,
  editable = false,
  className = '',
}: {
  billing: PublicCloudBillingDetailDecorated;
  data: { name: string; provider: Provider };
  task?: PublicCloudBillingSearchResponseMetadataTask;
  editable?: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [, userSnap] = useUserState();
  const { mutateAsync: sendTaskEmail, isPending: isSendingTaskEmail } = useMutation({
    mutationFn: _sendTaskEmail,
  });

  const canSign =
    !billing.signed &&
    !!userSnap.assignedTasks.find(
      (task) =>
        task.type === TaskType.SIGN_PUBLIC_CLOUD_MOU &&
        ([TaskStatus.ASSIGNED, TaskStatus.STARTED] as TaskStatus[]).includes(task.status) &&
        (task.data as { licencePlate: string }).licencePlate === billing.licencePlate,
    );

  const canEdit = billing._permissions.edit;

  const canReview =
    !billing.approved &&
    !!userSnap.assignedTasks.find(
      (task) =>
        task.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU &&
        ([TaskStatus.ASSIGNED, TaskStatus.STARTED] as TaskStatus[]).includes(task.status) &&
        (task.data as { licencePlate: string }).licencePlate === billing.licencePlate,
    );

  const getAssignedContent = () => (
    <>
      {billing.expenseAuthority && <UserProfile data={billing.expenseAuthority} />}
      <BillingDate date={billing.createdAt} />
    </>
  );

  const handleSignButtonClick = async () => {
    const res = await openPublicCloudMouSignModal({
      billingId: billing.id,
      licencePlate: billing.licencePlate,
      accountCoding: billing.accountCoding,
      name: data.name,
      provider: data.provider,
      editable,
    });
  };

  const getSignedContent = () => (
    <>
      {billing.signedBy && <UserProfile data={billing.signedBy} />}
      <BillingDate date={billing.signedAt} />
      {canEdit && editable && <Button onClick={handleSignButtonClick}>Re-sign eMOU</Button>}
    </>
  );

  const getApprovedContent = () => (
    <>
      {billing.approvedBy && <UserProfile data={billing.approvedBy} />}
      <BillingDate date={billing.approvedAt} />
      {data && session?.permissions.downloadPublicCloudBillingMou && (
        <Button
          color="success"
          loading={downloading}
          onClick={async () => {
            if (!data) return;
            setDownloading(true);
            await downloadPublicCloudBillingPDF(billing.id, getPublicCloudEmouFileName(data.name, data.provider));
            setDownloading(false);
          }}
        >
          Download
        </Button>
      )}
    </>
  );

  const getSiningContent = () => (
    <>
      {canSign && data ? (
        <Button onClick={handleSignButtonClick}>Sign eMOU</Button>
      ) : (
        <>
          <div>
            The Ministry’s
            <br />
            Expense Authority
          </div>
          {session?.permissions.viewPublicCloudBilling && task?.type === TaskType.SIGN_PUBLIC_CLOUD_MOU && (
            <Button
              className="mt-2"
              loading={isSendingTaskEmail}
              onClick={async () => {
                if (isSendingTaskEmail) return;
                await sendTaskEmail(task.id);
              }}
            >
              Resend
            </Button>
          )}
        </>
      )}
    </>
  );

  const getReviewingContent = () => (
    <>
      {canReview && data ? (
        <Button
          onClick={async () => {
            const res = await openPublicCloudMouReviewModal({
              billingId: billing.id,
              licencePlate: billing.licencePlate,
            });
          }}
        >
          Review eMOU
        </Button>
      ) : (
        <>
          <div>
            The CSBC Citizen Service’s
            <br />
            Expense Authority
          </div>
          {session?.permissions.viewPublicCloudBilling && task?.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU && (
            <Button
              className="mt-2"
              loading={isSendingTaskEmail}
              onClick={async () => {
                if (isSendingTaskEmail) return;
                await sendTaskEmail(task.id);
              }}
            >
              Resend
            </Button>
          )}
        </>
      )}
    </>
  );

  if (billing.approved) {
    return (
      <Stepper active={3} iconSize={35} className={cn(className)}>
        <Stepper.Step label="Assigned" description={getAssignedContent()} />
        <Stepper.Step label="Signed" description={getSignedContent()} />
        <Stepper.Step
          label="Approved"
          color="success"
          completedIcon={<IconConfetti style={{ width: rem(20), height: rem(20) }} />}
          description={getApprovedContent()}
        />
      </Stepper>
    );
  }

  if (billing.signed) {
    return (
      <Stepper active={3} iconSize={35} className={cn(className)}>
        <Stepper.Step label="Assigned" description={getAssignedContent()} />
        <Stepper.Step label="Signed" description={getSignedContent()} />
        <Stepper.Step label="Review" description={getReviewingContent()} loading />
      </Stepper>
    );
  }

  return (
    <Stepper active={2} iconSize={35} className={cn(className)}>
      <Stepper.Step label="Assigned" description={getAssignedContent()} />
      <Stepper.Step label="Sign" description={getSiningContent()} loading />
      <Stepper.Step
        label="Review"
        description={
          <span>
            The CSBC Citizen Service’s
            <br />
            Expense Authority
          </span>
        }
      />
    </Stepper>
  );
}
