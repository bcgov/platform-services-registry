import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconRepeat } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useParams } from 'next/navigation';
import { useState, Fragment } from 'react';
import { resendPrivateCloudRequest } from '@/services/backend/private-cloud/requests';

export default function PrivateCloudRequestOptions({
  id = '',
  canResend = false,
}: {
  id?: string;
  canResend?: boolean;
}) {
  const params = useParams();

  const {
    mutateAsync: resend,
    isPending: isResending,
    isError: isResendError,
    error: resendError,
  } = useMutation({
    mutationFn: () => resendPrivateCloudRequest(id),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Successfully resent!',
        autoClose: 5000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to resend request: ${error.message}`,
        autoClose: 5000,
      });
    },
  });

  if (!canResend) return null;

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Options
            <IconChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
              {canResend && (
                <MenuItem>
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
                      <IconRepeat
                        className="inline-block mr-3 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Resend
                    </button>
                  )}
                </MenuItem>
              )}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </>
  );
}
