'use client';

import { Button, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { createModal } from '@/core/modal';
import { cancelPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { success, failure } from '../notification';
import { openNotificationModal } from './notification';

interface ModalProps {
  requestId: string;
}

interface ModalState {
  success: boolean;
}

export const openPrivateCloudRequestCancelModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'md',
    title: 'Cancel Request?',
  },
  Component: function ({ requestId, state, closeModal }) {
    const { mutateAsync: cancelRequest, isPending: isCancelingRequest } = useMutation({
      mutationFn: () => cancelPrivateCloudRequest(requestId),
      onSuccess: () => {
        state.success = true;
        success();
        closeModal();
        openNotificationModal({
          callbackUrl: '/private-cloud/requests/all',
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
