import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { Fragment, useRef } from 'react';

export default function Modal({
  open,
  setOpen,
  redirectUrl,
  errorMessage,
}: {
  open: boolean;
  setOpen: any;
  redirectUrl: string;
  errorMessage: string;
}) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();

  const handleReturn = () => {
    setOpen(false);
    router.push(redirectUrl);
    router.refresh();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => {}}>
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

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="font-bcsans text-base lg:text-xl 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5"
                    >
                      An error has occurred: {errorMessage}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="font-bcsans text-sm text-gray-900">
                        We can not complete your request at this time. Please contact the registry team or try again
                        later.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={handleReturn}
                    ref={cancelButtonRef}
                  >
                    Return to Dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
