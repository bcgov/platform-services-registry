import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePathname, useRouter } from 'next/navigation';

interface ModalProps {
  open: boolean;
  setOpen: any;
  redirectUrl: string;
  isEditRequest?: boolean;
  isPublicCloud?: boolean;
  isPublicCreate?: boolean;
  isPublicEdit?: boolean;
  isDeleteRequest?: boolean;
}

export default function Modal({
  open,
  setOpen,
  redirectUrl,
  isEditRequest,
  isPublicCloud,
  isPublicCreate,
  isPublicEdit,
  isDeleteRequest,
}: ModalProps) {
  const cancelButtonRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleReturn = () => {
    setOpen(false);
    router.push(redirectUrl);
    router.refresh();
  };

  // Dynamically setting the modal title
  let modalTitle = 'Thank you! We have received your ';
  if (isDeleteRequest) {
    modalTitle += 'delete request.';
  } else if (isEditRequest) {
    modalTitle += 'edit request.';
  } else {
    modalTitle += 'product request.';
  }

  // Dynamically setting the modal message
  let modalMessage = 'We have received your ';
  if (isDeleteRequest) {
    modalMessage += 'delete request. ';
  } else if (isEditRequest) {
    modalMessage += 'edit request. ';
  } else {
    modalMessage += 'request for a new product. ';
  }
  modalMessage += 'The Product Owner and Technical Lead(s) will receive the approval/rejection decision via email.';

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
                      {modalTitle}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="font-bcsans text-sm text-gray-900">{modalMessage}</p>
                      <p className="font-bcsans text-sm text-gray-900 mt-4">
                        Alternatively, you can also track the status of your requests from the Registry App Dashboard
                      </p>
                    </div>
                    {isPublicCloud && isPublicCreate && (
                      <div className="bg-blue-50 mt-4 p-4 rounded-md flex">
                        <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
                          <span className="font-bold text-blue-700 font-sans text-xs">i</span>
                        </div>
                        <div>
                          <p className="font-bcsans text-sm text-blue-700 font-semibold mt-2">Note:</p>
                          <p className="font-bcsans text-sm text-blue-700 mt-1">
                            The approval of a new product creation request is subject to having a signed Memorandum of
                            Understanding (MoU) with the Public Cloud Team. If you do not have a MoU in place, please
                            email us at
                            <span> </span>
                            <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
                              Cloud.Pathfinder@gov.bc.ca
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    )}
                    {isPublicCloud && isPublicEdit && (
                      <div className="bg-blue-50 mt-4 p-4 rounded-md flex">
                        <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
                          <span className="font-bold text-blue-700 font-sans text-xs">i</span>
                        </div>
                        <div className="flex flex-row items-center">
                          <p className="font-bcsans text-sm text-blue-700 font-semibold mr-2">Note:</p>
                          <p className="font-bcsans text-sm text-blue-700">
                            In order to request a product deletion, please email us at
                            <span> </span>
                            <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
                              Cloud.Pathfinder@gov.bc.ca
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    )}
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
