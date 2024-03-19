import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, TrashIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import DeleteModal from '@/components/modal/PrivateCloudDelete';
import ReturnModal from '@/components/modal/Return';
import { useParams, useRouter } from 'next/navigation';
import ErrorModal from '@/components/modal/Error';
import { deletePrivateCloudProject } from '@/services/backend/private-cloud';

export default function Dropdown({ disabled = false }: { disabled?: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = useParams();

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

  if (disabled) return null;

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
              <Menu.Item>
                {({ active }) => (
                  <button
                    disabled={disabled}
                    type="button"
                    onClick={() => setShowModal(true)}
                    className={classNames(
                      'group flex items-center px-4 py-2 text-sm w-full',
                      active && !disabled ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    )}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
