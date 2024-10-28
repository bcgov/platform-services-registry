'use client';

import { Button, Divider, Grid, Box } from '@mantine/core';
import { createModal } from '@/core/modal';

interface ModalProps {
  content?: React.ReactNode;
}

interface ModalState {
  confirmed: boolean;
}

export const openConfirmModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Confirmation',
    withCloseButton: true,
    closeOnClickOutside: true,
    closeOnEscape: true,
  },
  Component: function ({ content = 'Are you sure you want to proceed?', state, closeModal }) {
    return (
      <Box pos="relative">
        {content}

        <Divider my="md" />

        <Grid className="mt-2">
          <Grid.Col span={4}></Grid.Col>
          <Grid.Col span={8} className="text-right">
            <Button
              color="secondary"
              onClick={() => {
                state.confirmed = false;
                closeModal();
              }}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={() => {
                state.confirmed = true;
                closeModal();
              }}
            >
              Confirm
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    );
  },
  onClose: () => {},
});
