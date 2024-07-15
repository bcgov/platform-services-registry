'use client';

import { createModal, ExtraModalProps } from '@/core/modal';

interface ModalProps {
  name: string;
}

interface ModalState {}

function TestModal({ name }: ModalProps & ExtraModalProps) {
  return <div>Hi {name}!</div>;
}

export const openTestModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'md',
    title: 'Test Modal',
  },
  Component: TestModal,
  condition: (props: ModalProps) => !!props.name,
  onClose: () => {},
});
