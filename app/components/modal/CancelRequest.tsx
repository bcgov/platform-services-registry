'use client';

import { Button, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { lowerCase } from 'lodash-es';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { createModal } from '@/core/modal';
import { ProjectContext } from '@/prisma/client';
import { cancelPrivateCloudRequest } from '@/services/backend/private-cloud/requests';
import { cancelPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import FormTextarea from '../generic/input/FormTextarea';
import { success, failure } from '../notification';
import { openNotificationModal } from './notification';

interface ModalProps {
  requestId: string;
  context: ProjectContext;
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
    const { data: session } = useSession({
      required: true,
    });
    const [decisionComment, setDecisionComment] = useState('');
    const isPublicAdmin = session?.isPublicAdmin;
    const { mutateAsync: cancelRequest, isPending: isCancelingRequest } = useMutation({
      mutationFn: async () =>
        context === ProjectContext.PRIVATE
          ? cancelPrivateCloudRequest(requestId)
          : cancelPublicCloudRequest(requestId, decisionComment),
      onSuccess: () => {
        state.success = true;
        success();
        closeModal();
        openNotificationModal({
          callbackUrl: `/${lowerCase(context)}-cloud/requests/all`,
          content: <p>This request has been successfully cancelled!</p>,
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
        {isPublicAdmin && (
          <FormTextarea
            name="decisionComment"
            label="Reason for cancellation"
            value={decisionComment}
            onChange={(e) => setDecisionComment(e.target.value)}
            required
            classNames={{
              wrapper: 'mb-4',
            }}
          />
        )}

        <div className="flex justify-end gap-x-2">
          <Button color="gray" onClick={() => closeModal()}>
            No
          </Button>
          <Button
            variant="outline"
            color="red"
            disabled={isPublicAdmin && !decisionComment.trim()}
            onClick={() => {
              if (isPublicAdmin && !decisionComment.trim()) return;
              cancelRequest();
            }}
          >
            Yes, Cancel the Request
          </Button>
        </div>
      </Box>
    );
  },
  onClose: () => {},
});
