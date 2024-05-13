import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useState } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';

export default function CreatePublicCloud({
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
  const [confirmSigned, setConfirmSigned] = useState(false);
  const [confirmLiable, setConfirmLiable] = useState(false);
  const cancelButtonRef = useRef(null);

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
                      step, the approval process, where a human is involved. They&apos;ll take the opportunity, if
                      needed, to reach out and have an on-boarding conversation with you.
                    </p>
                    <p className="font-bcsans text-sm text-gray-900 mt-4">
                      Also, look out for our notification emails that will provide you with valuable information
                      regarding your product status and details.
                    </p>
                  </div>
                  <div className="bg-blue-50 mt-4 p-4 rounded-md flex">
                    <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
                      <span className="font-bold text-blue-700 font-sans text-xs">i</span>
                    </div>
                    <div>
                      <p className="font-bcsans text-sm text-blue-700 font-semibold mt-2">Note:</p>
                      <p className="font-bcsans text-sm text-blue-700 mt-1">
                        Provisioning Requests for BC Gov&apos;s Landing Zone in AWS - Ministry Product Teams are
                        required to complete two prior steps:
                      </p>
                      <ol className="font-bcsans text-sm text-blue-700 mt-1 pl-5 list-decimal" type="I">
                        <li className="py-2">
                          Sign a Memorandum of Understanding (MoU) with the Public Cloud Accelerator Service Team. If
                          you do not have a MoU in place, please email us at{' '}
                          <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
                            Cloud.Pathfinder@gov.bc.ca
                          </a>
                          .
                        </li>
                        <li className="py-2">
                          Attend an onboarding session with the Public Cloud Accelerator Service Team. To book an
                          onboarding session, please email us at{' '}
                          <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
                            Cloud.Pathfinder@gov.bc.ca
                          </a>
                          .
                        </li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex mt-8 pt-4">
                    <FormCheckbox
                      id="consent1"
                      checked={confirmSigned}
                      onChange={() => setConfirmSigned(!confirmSigned)}
                    >
                      <p className="font-bcsans text-sm text-gray-900">
                        By checking this box, I confirm that the ministry product team has signed a Memorandum of
                        Understanding (MoU) and have attended an onboarding session with the Public Cloud Accelerator
                        Service Team. I also confirm that I have read and understood the roles and responsibilities as
                        described in the
                        <ExternalLink
                          href="https://digital.gov.bc.ca/cloud/services/public/onboard/#understand"
                          className="ml-1"
                        >
                          Public Cloud Services Shared Responsibility Model
                        </ExternalLink>
                        .
                      </p>
                    </FormCheckbox>
                  </div>
                  <div className="flex pt-2 pb-5">
                    <FormCheckbox
                      id="consent2"
                      checked={confirmLiable}
                      onChange={() => setConfirmLiable(!confirmLiable)}
                    >
                      <p className="font-bcsans text-sm text-gray-900">
                        By checking this box, I confirm that the ministry product team is liable to pay the base charge
                        of USD 200 to 300 per month for each project set created.
                      </p>
                    </FormCheckbox>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    // "mt-3 inline-flex items-center justify-center -md bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!(confirmLiable && confirmSigned)}
                      className={`inline-flex justify-center ${
                        confirmLiable && confirmSigned ? 'bg-bcorange' : 'bg-bcorange/50'
                      } rounded-md  px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2`}
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
