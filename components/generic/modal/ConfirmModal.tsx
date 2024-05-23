'use client';

import { ScrollArea } from '@mantine/core';
import { modals } from '@mantine/modals';

const defaultValues = { confirmed: false };
const modalId = 'ConfirmModal';

interface State {
  confirmed: boolean;
}

interface ModalProps {
  title?: string;
  message?: string;
}

function ConfirmModal({
  message = 'Are you sure you want to proceed?',
  instanceState,
}: ModalProps & { instanceState: State }) {
  return (
    <>
      <div className="">
        <p>{message}</p>
      </div>

      <div className="flex justify-between mt-2">
        <div></div>
        <div>
          <button
            className="h-9 inline-flex items-center rounded-md bg-gray-500 gap-x-2 px-4 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300"
            onClick={() => {
              instanceState.confirmed = false;
              modals.close(modalId);
            }}
          >
            Cancel
          </button>
          <button
            className="h-9 inline-flex items-center rounded-md bg-green-700 gap-x-2 px-4 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-green-300 ml-1"
            onClick={() => {
              instanceState.confirmed = true;
              modals.close(modalId);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}

export function openConfirmModal(props: ModalProps) {
  const instanceState = { ...defaultValues };

  return new Promise<State>((resolve, reject) => {
    return modals.open({
      modalId,
      size: 'md',
      onClose: () => resolve({ ...instanceState }),
      // closeOnClickOutside: false,
      scrollAreaComponent: ScrollArea.Autosize,
      title: props.title || 'Confirmation',
      children: <ConfirmModal {...props} instanceState={instanceState} />,
      className: '',
      overlayProps: {
        className: '',
      },
    });
  });
}
