import { Menu, MenuItems, MenuItem, MenuButton, Transition } from '@headlessui/react';
import { notifications } from '@mantine/notifications';
import { IconRepeat, IconChevronDown } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useParams } from 'next/navigation';
import { useState, Fragment } from 'react';
import DeleteButton from '@/components/buttons/DeleteButton';
import ErrorModal from '@/components/modal/Error';
import PrivateCloudDeleteModal from '@/components/modal/PrivateCloudDelete';
import ReturnModal from '@/components/modal/Return';
import { deletePrivateCloudProject, reprovisionPrivateCloudProduct } from '@/services/backend/private-cloud/products';

export default function PrivateCloudProductOptions({
  licencePlate = '',
  canReprovision = false,
  canDelete = false,
}: {
  licencePlate?: string;
  canReprovision?: boolean;
  canDelete?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = useParams();

  const {
    mutateAsync: reprovision,
    isPending: isReprovisioning,
    isError: isReprovisionError,
    error: reprovisionError,
  } = useMutation({
    mutationFn: () => reprovisionPrivateCloudProduct(licencePlate),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Successfully reprovisioned!',
        autoClose: 5000,
      });
    },
  });

  const onSubmit = async () => {
    setIsSubmitLoading(true);
    try {
      await deletePrivateCloudProject(params.licencePlate as string);
      setShowModal(false);
      setShowReturnModal(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        notifications.show({
          color: 'red',
          title: 'Error',
          message: `Failed to delete project: ${error.message}`,
          autoClose: 5000,
        });
      } else {
        setErrorMessage('An unknown error occurred');
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'An unknown error occurred',
          autoClose: 5000,
        });
      }
      setIsSubmitLoading(false);
      setShowModal(false);
      setShowErrorModal(true);
    }
  };

  if (!canDelete && !canReprovision) return null;

  return (
    <>
      <PrivateCloudDeleteModal
        open={showModal}
        setOpen={setShowModal}
        isSubmitLoading={isSubmitLoading}
        onSubmit={onSubmit}
      />
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
      {!canReprovision ? (
        <DeleteButton canDelete={canDelete} setShowModal={setShowModal} active={true} />
      ) : (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Options
              <IconChevronDown className="-mr-1 h-5 w-5 text-gray-400" />
            </MenuButton>
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
            <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {canReprovision && (
                  <MenuItem>
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
                        <IconRepeat className="inline-block mr-2" />
                        Reprovision
                      </button>
                    )}
                  </MenuItem>
                )}
                {canDelete && (
                  <MenuItem>
                    {({ active }) => <DeleteButton canDelete={canDelete} setShowModal={setShowModal} active={active} />}
                  </MenuItem>
                )}
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      )}
    </>
  );
}
