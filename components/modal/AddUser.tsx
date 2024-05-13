import { Dialog, Combobox, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import UserInfoField from '@/components/modal/AddUserFields';
import { parseMinistryFromDisplayName } from '@/helpers/user';
import { listUsersByEmail } from '@/services/backend/msal';
import { AppUser } from '@/types/user';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUserPrincipalName: React.Dispatch<React.SetStateAction<string>>;
  setUserEmail: React.Dispatch<React.SetStateAction<string>>;
}

export default function AddUserModal({ open, setOpen, setUserPrincipalName, setUserEmail }: Props) {
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<AppUser | undefined>({
    id: '0',
    upn: '',
    email: '',
    idir: '',
    idirGuid: '',
    displayName: '',
    firstName: '',
    lastName: '',
    ministry: '',
  });

  const [confirm, setConfirm] = useState(false);

  const {
    data: people,
    isLoading,
    error,
  } = useQuery<AppUser[], Error>({
    queryKey: ['people', query],
    queryFn: () => listUsersByEmail(query || ''),
    enabled: !!query,
  });

  const autocompleteOnChangeHandler = (value: AppUser) => {
    setSelected(value);
    setQuery(value.email);
    setConfirm(true);
  };

  const parseMinistry = (displayName: string): string => {
    const localDisplayName = parseMinistryFromDisplayName(displayName);
    return displayName ? (localDisplayName !== '' ? localDisplayName : confirm ? 'Not Found' : '') : '';
  };

  const handleAddUserBtn = () => {
    if (selected) {
      setUserPrincipalName(selected.upn);
      setUserEmail(selected.email);
    }
    setSelected(undefined);
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setOpen(false);
          setConfirm(false);
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
                        Please enter email of a person you want to add.
                      </p>
                    </div>
                  </div>
                </div>
                <Combobox value={selected} onChange={autocompleteOnChangeHandler} disabled={false}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default rounded-lg bg-white text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <Combobox.Input
                        autoComplete="xyz"
                        displayValue={(user: AppUser) => user?.email}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={'Enter email'}
                        value={query}
                        className="min-w-full"
                      />
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {isLoading ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Loading...</div>
                        ) : error ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Error fetching data.
                          </div>
                        ) : people && people.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            No IDIR linked email address found.
                          </div>
                        ) : (
                          people &&
                          people.map((user) => (
                            <Combobox.Option
                              key={user?.email}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-teal-600 text-white' : 'text-gray-900'
                                }`
                              }
                              value={user}
                            >
                              {({ selected: sel, active }) => (
                                <>
                                  <span className={`block truncate ${sel ? 'font-medium' : 'font-normal'}`}>
                                    {user?.email}
                                  </span>
                                  {sel ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
                <UserInfoField
                  name={'First Name'}
                  value={selected?.firstName ? selected.firstName : confirm ? 'Not Found' : ''}
                />
                <UserInfoField
                  name={'Last Name'}
                  value={selected?.lastName ? selected.lastName : confirm ? 'Not Found' : ''}
                />
                <UserInfoField name={'Ministry'} value={selected ? parseMinistry(selected.displayName) : 'Not Found'} />
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    onClick={() => {
                      setOpen(false);
                      setConfirm(false);
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    disabled={!confirm}
                    type="button"
                    onClick={handleAddUserBtn}
                    className={`inline-flex justify-center rounded-md px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2
                                            ${
                                              confirm
                                                ? 'bg-bcorange hover:brightness-110'
                                                : 'bg-bcorange/50 brightness-110'
                                            }`}
                  >
                    ADD A USER
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
