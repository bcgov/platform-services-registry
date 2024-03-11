import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function Modal({
  open,
  setOpen,
  handleSubmit,
  isLoading,
}: {
  open: boolean;
  setOpen: any;
  handleSubmit: any;
  isLoading: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const cancelButtonRef = useRef(null);

  const handleCheck = () => {
    setConfirm(!confirm);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="font-bcsans text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5"
                  >
                    All Set?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="font-bcsans text-sm text-gray-900">
                      After hitting request, our smart robots will start working hard behind the scenes. There is one
                      step, the approval process, where a human is involved. They will take the opportunity, if needed,
                      to reach out and have an on-boarding conversation with you.
                    </p>
                    <p className="font-bcsans text-sm text-gray-900 mt-4">
                      Also, look out for our notification emails that will provide you with valuable information
                      regarding your product status and details.
                    </p>
                  </div>
                  <div className="flex border-t-1 mt-8 pt-4">
                    <input
                      id="none"
                      name="none"
                      type="checkbox"
                      checked={confirm}
                      onChange={handleCheck}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-4 mr-4"
                    />
                    <p className="font-bcsans text-sm text-gray-900 mt-4">
                      By checking this box, I confirm that I have read and understood the roles and responsibilities as
                      described in the
                      <a
                        href="https://digital.gov.bc.ca/cloud/services/private/onboard/"
                        target="_blank"
                        className="ml-1 underline text-blue-700"
                        rel="noreferrer"
                      >
                        Onboarding Guide.
                      </a>
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    PREVIOUS
                  </button>
                  {isLoading ? (
                    <button
                      disabled
                      type="button"
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      <div
                        className="mr-2 mt-1 inline-block h-3 w-3 animate-spin rounded-full border-3 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"></span>
                      </div>
                      Loading...
                    </button>
                  ) : confirm ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex justify-center rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      SUBMIT REQUEST
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      SUBMIT REQUEST
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
