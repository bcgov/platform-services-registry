import { Button } from '@mantine/core';
import { ProjectContext } from '@prisma/client';
import { IconCancel } from '@tabler/icons-react';
import { openRequestCancelModal } from '../modal/CancelRequest';

export default function CancelRequest({ id, context }: { id: string; context: ProjectContext }) {
  const handleCancel = async () => {
    await openRequestCancelModal({
      requestId: id,
      context,
    });
  };

  return (
    <Button color="red" variant="outline" onClick={handleCancel} leftSection={<IconCancel />}>
      Cancel Request
    </Button>
  );
}
