'use client';

import { Button, Divider, Grid, Box } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { createModal } from '@/core/modal';

interface ModalProps {
  content: React.ReactNode;
  callbackUrl?: string;
  success?: boolean;
}

interface ModalState {}

export const openNotificationModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Complete!',
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
  },
  Component: function ({ content, callbackUrl, success = true, closeModal }) {
    const router = useRouter();

    return (
      <Box pos="relative">
        {content}

        <Divider my="md" />

        <Grid className="mt-2">
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button
              color={success ? 'success' : 'danger'}
              onClick={() => {
                if (callbackUrl) router.push(callbackUrl);
                closeModal();
              }}
            >
              Close
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    );
  },
  onClose: () => {},
});
