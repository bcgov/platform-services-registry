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

export const openCompleteModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
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
              className="mr-1"
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
