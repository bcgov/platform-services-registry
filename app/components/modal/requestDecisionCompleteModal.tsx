'use client';

import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { createModal } from '@/core/modal';

interface ModalProps {
  callbackUrl: string;
}

interface ModalState {}

export const openRequestDecisionCompleteModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Your decision has been shared successfully!',
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
  },
  Component: function ({ callbackUrl, closeModal }) {
    const router = useRouter();

    return (
      <Box pos="relative">
        <p className="text-sm text-gray-900">
          The registry has been updated to reflect your decision. The Product Owner and Technical Lead(s) will receive a
          notification regarding the decision via email.
        </p>

        <Divider my="md" />

        <Grid className="mt-2">
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button
              color="success"
              onClick={() => {
                router.push(callbackUrl);
                closeModal();
              }}
              className="mr-1"
            >
              Return to Dashboard
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    );
  },
  onClose: () => {},
});
