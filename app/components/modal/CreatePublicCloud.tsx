import { Dialog, Transition } from '@headlessui/react';
import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Fragment, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import MailLink from '@/components/generic/button/MailLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { publicCloudTeamEmail } from '@/constants';
import { getBilling } from '@/services/backend/billing';

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
  const { getValues } = useFormContext();

  const values = getValues();

  const {
    data: billing,
    isLoading: isBillingLoading,
    isError: isBillingError,
    error: billingError,
  } = useQuery({
    queryKey: ['billing', values.accountCoding],
    queryFn: () => {
      const code = values.accountCoding;
      if (code.length < 24) return null;
      return getBilling(values.accountCoding, values.provider);
    },
  });

  if (isBillingLoading) return null;

  let eMouCheckboxContent = null;
  if (billing) {
    if (billing.approved) {
      eMouCheckboxContent = (
        <p className="text-sm text-gray-900">
          Our records show that your team already has a signed MoU with OCIO for {values.provider} use. This new product
          will be added to the existing MoU. A copy of the signed MoU for this product will be emailed to the Ministry
          Expense Authority.
        </p>
      );
    }
  } else {
    eMouCheckboxContent = (
      <p className="text-sm text-gray-900">
        No eMOU exists for this account coding. We will initiate the process by sending an email to the EA for their
        signature. After the eMOU is signed, it will be reviewed and approved, which typically takes up to 2 business
        days.
      </p>
    );
  }

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
                  <Dialog.Title as="h3" className="text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5">
                    All Set?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">
                      After hitting request, our smart robots will start working hard behind the scenes. There is one
                      step, the approval process, where a human is involved. They&apos;ll take the opportunity, if
                      needed, to reach out and have an on-boarding conversation with you.
                    </p>
                    <p className="text-sm text-gray-900 mt-4">
                      Also, look out for our notification emails that will provide you with valuable information
                      regarding your product status and details.
                    </p>
                  </div>
                  <Alert variant="" color="primary" title="Note:" className="mt-2" icon={<IconInfoCircle size={80} />}>
                    <div className="text-sm text-blue-700">
                      Ministry Teams provisioning access to BC Gov&apos;s Landing Zones in AWS and Azure are required to
                      attend an onboarding session with the Public Cloud Team. To book an onboarding session, please
                      email us at <MailLink to={publicCloudTeamEmail} />.
                    </div>
                  </Alert>
                  <div className="pt-4">
                    <FormCheckbox
                      id="consent1"
                      checked={confirmSigned}
                      onChange={() => setConfirmSigned(!confirmSigned)}
                    >
                      {eMouCheckboxContent}
                    </FormCheckbox>
                  </div>
                  <div className="pt-2 pb-5">
                    <FormCheckbox
                      id="consent2"
                      checked={confirmLiable}
                      onChange={() => setConfirmLiable(!confirmLiable)}
                    >
                      <p className="text-sm text-gray-900">
                        By checking this box, I confirm that the ministry product team is liable to pay the base charge
                        of USD 200 to 300 per month for each project set created.
                      </p>
                    </FormCheckbox>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
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
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
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
                      } rounded-md  px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2`}
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
