import { Dialog, Transition } from '@headlessui/react';
import { Fragment, FunctionComponent } from 'react';
import { camelCaseToWords } from '@/utils/string';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    image?: string | null;
  };
}

export const UserProfilePopUp: FunctionComponent<UserProfilePopupProps> = ({ isOpen, onClose, user }) => {
  const uniqueRoles = Array.from(new Set(user.roles.map((role) => camelCaseToWords(role))));
  const formattedPermissions = user.permissions.map((permission) => camelCaseToWords(permission));

  const getImageSrc = (image: string | null | undefined) => {
    if (!image) {
      return undefined;
    }
    return image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                {user.image && (
                  <img
                    src={getImageSrc(user.image)}
                    alt="User Profile"
                    className="mx-auto h-24 w-24 rounded-full object-cover mb-4"
                  />
                )}
                <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900 mb-4">
                  {user.name}
                </Dialog.Title>
                <div className="text-md text-gray-500 mb-6">
                  <strong>{user.email}</strong>
                  <div style={{ marginBottom: '20px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'center', maxWidth: '100%', margin: 'auto' }}>
                    <div style={{ textAlign: 'left', marginRight: '2rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <strong>Roles:</strong>
                      </div>
                      {uniqueRoles.map((role) => (
                        <li key={role}>{role}</li>
                      ))}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ textAlign: 'center' }}>
                        <strong>Permissions:</strong>
                      </div>
                      {formattedPermissions.map((perm) => (
                        <li key={perm}>{perm}</li>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex w-full justify-center rounded-md bg-bcorange px-4 py-2 text-sm text-bcblue shadow-sm hover:bg-bcorange-dark tracking-[.2em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  Close
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
