import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@/app/api/public-cloud/aws-roles/helpers';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  person: User;
  userRole: string;
}

export default function DeleteUserModal({ open, setOpen, setUserId, person, userRole }: Props) {
  const handleDeleteUserBtn = () => {
    setUserId(person.id);
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setOpen(false);
        }}
      >
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
        <div className="fixed inset-0 z-10 max-w-max m-auto overflow-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-5 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="font-bcsans text-base lg:text-xl 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5"
                    ></Dialog.Title>
                    <div className="mt-2">
                      <p className="font-bcsans text-sm text-gray-900">
                        {`Are you sure you want to remove ${person.firstName} ${person.lastName} from ${userRole}s list.`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUserBtn}
                    className={
                      'bg-bcorange hover:brightness-110 inline-flex justify-center rounded-md px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2'
                    }
                  >
                    DELETE USER
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
