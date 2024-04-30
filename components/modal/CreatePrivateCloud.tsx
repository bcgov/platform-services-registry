import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import Modal from '@/components/generic/modal/Modal';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import ExternalLink from '@/components/generic/button/ExternalLink';

export default function CreatePrivateCloud({
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
    <Modal isOpen={open} onClose={setOpen}>
      <div className="">
        <Dialog.Title as="h3" className="font-bcsans text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5">
          All Set?
        </Dialog.Title>
        <div className="mt-2">
          <p className="font-bcsans text-sm text-gray-900">
            After hitting request, our smart robots will start working hard behind the scenes. There is one step, the
            approval process, where a human is involved. They will take the opportunity, if needed, to reach out and
            have an on-boarding conversation with you.
          </p>
          <p className="font-bcsans text-sm text-gray-900 mt-4">
            Also, look out for our notification emails that will provide you with valuable information regarding your
            product status and details.
          </p>
        </div>
        <div className="border-t-1 mt-8 pt-4">
          <FormCheckbox id="consent" checked={confirm} onChange={handleCheck}>
            <p className="text-sm text-gray-900">
              By checking this box, I confirm that I have read and understood the roles and responsibilities as
              described in the
              <ExternalLink href="https://digital.gov.bc.ca/cloud/services/private/onboard/" className="ml-1">
                Onboarding Guide.
              </ExternalLink>
            </p>
          </FormCheckbox>
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
    </Modal>
  );
}
