import { useState, Fragment } from 'react';
import { toast } from 'react-toastify';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, TrashIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import { useQuery, useMutation } from '@tanstack/react-query';
import DeleteModal from '@/components/modal/PrivateCloudDelete';
import ReturnModal from '@/components/modal/Return';
import { useParams, useRouter } from 'next/navigation';
import ErrorModal from '@/components/modal/Error';
import {
  deletePrivateCloudProject,
  reprovisionPriviateCloudRequest,
  resendPriviateCloudRequest,
} from '@/services/backend/private-cloud';

export default function Dropdown({
  licensePlace = '',
  canReprovision = false,
  canResend = false,
  canDelete = false,
}: {
  licensePlace?: string;
  canReprovision?: boolean;
  canResend?: boolean;
  canDelete?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = useParams();

  const {
    mutateAsync: resend,
    isPending: isResending,
    isError: isResendError,
    error: resendError,
  } = useMutation({
    mutationFn: () => resendPriviateCloudRequest(licensePlace),
    onSuccess: () => {
      toast.success('Successfully resent!');
    },
  });

  const {
    mutateAsync: reprovision,
    isPending: isReprovisioning,
    isError: isReprovisionError,
    error: reprovisionError,
  } = useMutation({
    mutationFn: () => reprovisionPriviateCloudRequest(licensePlace),
    onSuccess: () => {
      toast.success('Successfully reprovisioned!');
    },
  });

  const onSubmit = async () => {
    setIsSubmitLoading(true);
    try {
      await deletePrivateCloudProject(params.licencePlate as string);
      setShowModal(false);
      setShowReturnModal(true);
    } catch (error) {
      setErrorMessage(String(error));
      setIsSubmitLoading(false);
      setShowModal(false);
      setShowErrorModal(true);
    }
  };

  if (!canDelete && !canReprovision && !canResend) return null;

  return (
    <>
      <DeleteModal open={showModal} setOpen={setShowModal} isSubmitLoading={isSubmitLoading} onSubmit={onSubmit} />
      <ReturnModal
        open={showReturnModal}
        setOpen={setShowReturnModal}
        redirectUrl="/private-cloud/products/all"
        modalTitle="Thank you! We have received your delete request."
        modalMessage="We have received your delete request for this product. The Product Owner and Technical Lead(s) will receive an update via email."
      />
      <ErrorModal
        open={showErrorModal}
        setOpen={setShowErrorModal}
        errorMessage={errorMessage}
        redirectUrl="/private-cloud/products/all"
      />
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Options
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {canResend && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      disabled={!canResend}
                      type="button"
                      onClick={async () => {
                        await resend();
                      }}
                      className={classNames(
                        'group flex items-center px-4 py-2 text-sm w-full',
                        active && canResend ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      )}
                    >
                      <PlayCircleIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Resend
                    </button>
                  )}
                </Menu.Item>
              )}
              {canReprovision && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      disabled={!canReprovision}
                      type="button"
                      onClick={async () => {
                        await reprovision();
                      }}
                      className={classNames(
                        'group flex items-center px-4 py-2 text-sm w-full',
                        active && canReprovision ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      )}
                    >
                      <PlayCircleIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Reprovision
                    </button>
                  )}
                </Menu.Item>
              )}
              {canDelete && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      disabled={!canDelete}
                      type="button"
                      onClick={() => setShowModal(true)}
                      className={classNames(
                        'group flex items-center px-4 py-2 text-sm w-full',
                        active && canDelete ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      )}
                    >
                      <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
