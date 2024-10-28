import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { openPublicCloudProductDeleteModal } from '@/components/modal/publicCloudProductDelete';
import { usePublicProductState } from '@/states/global';

export default function PublicCloudProductOptions({ disabled = false }: { disabled?: boolean }) {
  const [, snap] = usePublicProductState();

  if (disabled) return null;

  return (
    <>
      <Button
        color="danger"
        size="sm"
        leftSection={<IconTrash size={20} />}
        onClick={async () => {
          if (snap.currentProduct) {
            await openPublicCloudProductDeleteModal({ product: snap.currentProduct });
          }
        }}
      >
        Delete
      </Button>
    </>
  );
}
