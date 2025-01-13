'use client';

import { Button, LoadingOverlay, Box } from '@mantine/core';
import { ProjectContext } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { lowerCase } from 'lodash-es';
import { createModal } from '@/core/modal';
import { cancelPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { cancelPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { success, failure } from '../notification';
import { openNotificationModal } from './notification';

interface ModalProps {
  requestId: string;
  context: 'PRIVATE' | 'PUBLIC';
}

interface ModalState {
  success: boolean;
}

export const openRequestCancelModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'md',
    title: 'Cancel Request?',
  },
  Component: function ({ requestId, context, state, closeModal }) {
    const { mutateAsync: cancelRequest, isPending: isCancelingRequest } = useMutation({
      mutationFn: async () =>
        context === ProjectContext.PRIVATE ? cancelPrivateCloudRequest(requestId) : cancelPublicCloudRequest(requestId),
      onSuccess: () => {
        state.success = true;
        success();
        closeModal();
        openNotificationModal({
          callbackUrl: `/${lowerCase(context)}-cloud/requests/all`,
          content: <p>The request for the product has been successfully cancelled.</p>,
        });
      },
      onError: (error) => {
        failure({ error });
      },
    });

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isCancelingRequest} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <p className="text-sm text-gray-900 mb-4">
          Are you sure you want to cancel this request? This action cannot be undone!
        </p>
        <div className="flex justify-end gap-x-2">
          <Button color="gray" onClick={() => closeModal()}>
            No
          </Button>
          <Button variant="outline" color="red" onClick={() => cancelRequest()}>
            Yes, Cancel the Request
          </Button>
        </div>
      </Box>
    );
  },
  onClose: () => {},
});
