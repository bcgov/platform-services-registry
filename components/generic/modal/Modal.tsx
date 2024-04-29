import { Fragment, useRef, FormEventHandler, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import classnames from 'classnames';

export default function Modal({
  isOpen,
  onClose,
  onSubmit,
  children,
  className = 'sm:max-w-2xl',
}: {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  onSubmit?: FormEventHandler<HTMLFormElement> | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  const focusRef = useRef(null);

  if (!isOpen) return null;

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={focusRef} onClose={onClose}>
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                as={onSubmit ? 'form' : 'div'}
                {...(onSubmit ? { onSubmit } : {})}
                className={classnames(
                  'relative transform rounded-lg bg-white text-left shadow-xl transition-all overflow-hidden px-4 pb-5 pt-5 sm:my-8 sm:w-full sm:max-w-4xl sm:p-6',
                  className,
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
