'use client';

import { createModal } from '@/core/modal';

interface ModalProps {
  name: string;
}

interface ModalState {}

export const openTestModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'md',
    title: 'Test Modal',
  },
  Component: function TestModal({ name, closeModal }) {
    return <div>Hi {name}!</div>;
  },
  condition: (props: ModalProps) => !!props.name,
  onClose: () => {},
});
