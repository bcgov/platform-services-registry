import { Menu, Button, Text, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconRepeat, IconChevronDown, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { openPrivateCloudProductDeleteModal } from '@/components/modal/privateCloudProductDelete';
import { showErrorNotification } from '@/helpers/notifications';
import { reprovisionPrivateCloudProduct } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';

export default function PrivateCloudProductOptions({
  licencePlate = '',
  canReprovision = false,
  canDelete = false,
}: {
  licencePlate?: string;
  canReprovision?: boolean;
  canDelete?: boolean;
}) {
  const [, snap] = usePrivateProductState();
  const {
    mutateAsync: reprovision,
    isPending: isReprovisioning,
    isError: isReprovisionError,
    error: reprovisionError,
  } = useMutation({
    mutationFn: () => reprovisionPrivateCloudProduct(licencePlate),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Successfully reprovisioned!',
        autoClose: 5000,
      });
    },
    onError: (error: any) => {
      showErrorNotification(error);
    },
  });

  if (!canDelete && !canReprovision) return null;

  if (!canReprovision) {
    return (
      <Button
        color="danger"
        size="sm"
        disabled={!canDelete}
        leftSection={<IconTrash size={20} />}
        onClick={async () => {
          if (snap.currentProduct) {
            await openPrivateCloudProductDeleteModal({ product: snap.currentProduct });
          }
        }}
      >
        Delete
      </Button>
    );
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button color="primary" rightSection={<IconChevronDown style={{ width: rem(14), height: rem(14) }} />}>
          Options
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {canReprovision && (
          <Menu.Item
            leftSection={<IconRepeat style={{ width: rem(14), height: rem(14) }} />}
            onClick={async () => {
              await reprovision();
            }}
          >
            Reprovision
          </Menu.Item>
        )}
        {canDelete && (
          <Menu.Item
            leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
            onClick={async () => {
              if (snap.currentProduct) {
                await openPrivateCloudProductDeleteModal({ product: snap.currentProduct });
              }
            }}
          >
            Delete
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
