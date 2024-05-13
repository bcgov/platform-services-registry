import { Dialog, Transition } from '@headlessui/react';
import React from 'react';

interface AlertBoxProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  singleButton?: boolean;
}

const AlertBox: React.FC<AlertBoxProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  singleButton = false,
}) => {
  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onCancel}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="text-center">
                  <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900 mb-4">
                    {title}
                  </Dialog.Title>

                  <p className="text-md text-gray-500 mb-6">{message}</p>

                  <div
                    className={`mt-4 ${
                      singleButton
                        ? 'flex justify-center'
                        : 'sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3'
                    }`}
                  >
                    {!singleButton && onCancel && (
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bcsans text-bcblue shadow-sm hover:bg-gray-50 tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={onCancel}
                      >
                        {cancelButtonText}
                      </button>
                    )}
                    {singleButton && onCancel && (
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-bcorange px-4 py-2 text-sm font-bcsans text-bcblue shadow-sm hover:bg-bcorange-dark tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        onClick={onCancel}
                      >
                        {cancelButtonText}
                      </button>
                    )}
                    {!singleButton && onConfirm && (
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-bcorange px-4 py-2 text-sm font-bcsans text-bcblue shadow-sm hover:bg-bcorange-dark tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        onClick={onConfirm}
                      >
                        {confirmButtonText}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AlertBox;
