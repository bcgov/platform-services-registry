import { Button } from '@mantine/core';
import { ProjectContext } from '@prisma/client';
import { IconCancel } from '@tabler/icons-react';
import { openPrivateCloudRequestCancelModal } from '../modal/privateCloudRequestCancel';
import { openPublicCloudRequestCancelModal } from '../modal/publicCloudRequestCancel';

export default function CancelRequest({ id, context }: any) {
  const handleCancel = async () => {
    if (context === ProjectContext.PRIVATE) {
      await openPrivateCloudRequestCancelModal({
        requestId: id,
      });
    } else {
      await openPublicCloudRequestCancelModal({
        requestId: id,
      });
    }
  };

  return (
    <Button color="red" variant="outline" onClick={handleCancel} leftSection={<IconCancel />}>
      Cancel Request
    </Button>
  );
}
