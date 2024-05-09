import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import classNames from '@/utils/classnames';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import ProfileImage from '../ProfileImage';
import { useAppState } from '@/states/global';
import { signOut } from '@/helpers/auth';
import { UserProfilePopUp } from '@/components/dropdowns/UserProfile';

export default function ProfileDropdown() {
  const [appState, appSnapshot] = useAppState();
  const { data: session, status } = useSession();
  const { permissions } = session ?? {};
  const [isProfileOpen, setProfileOpen] = useState(false);
  const handleOpenProfile = () => setProfileOpen(true);
  const handleCloseProfile = () => setProfileOpen(false);

  const userProfile =
    session && session.user
      ? {
          name: session.user.name,
          email: session.user.email,
          roles: session.roles || ['user'],
        }
      : undefined;

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <ProfileImage email={session?.user.email ?? ''} image={session?.user.image ?? ''} />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* <Menu.Item>
            {({ active }) => (
              <Link
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
              >
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
              >
                Settings
              </Link>
            )}
          </Menu.Item> */}
          {status === 'authenticated' && (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleOpenProfile}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block w-full text-left px-4 py-2 text-sm text-gray-700',
                  )}
                >
                  Profile
                </button>
              )}
            </Menu.Item>
          )}
          {permissions?.viewZapscanResults && (
            <Menu.Item>
              {({ active, close }) => (
                <div>
                  <Link
                    href="/zapscan/results"
                    onClick={close}
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Zap Scan Results
                  </Link>
                </div>
              )}
            </Menu.Item>
          )}
          {permissions?.viewSonarscanResults && (
            <Menu.Item>
              {({ active, close }) => (
                <div>
                  <Link
                    href="/sonarscan/results"
                    onClick={close}
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Sonar Scan Results
                  </Link>
                </div>
              )}
            </Menu.Item>
          )}
          {permissions?.viewPrivateAnalytics && (
            <Menu.Item>
              {({ active, close }) => (
                <div>
                  <Link
                    href="/private-cloud/analytics"
                    onClick={close}
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Private Cloud Analytics
                  </Link>
                </div>
              )}
            </Menu.Item>
          )}
          {permissions?.viewPublicAnalytics && (
            <Menu.Item>
              {({ active, close }) => (
                <div>
                  <Link
                    href="/public-cloud/analytics"
                    onClick={close}
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Public Cloud Analytics
                  </Link>
                </div>
              )}
            </Menu.Item>
          )}
          <Menu.Item>
            {({ active }) => (
              <div>
                {status !== 'authenticated' ? (
                  <Link
                    href="#"
                    onClick={() =>
                      signIn('keycloak', {
                        callbackUrl: '/private-cloud/products/all',
                      })
                    }
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Sign In
                  </Link>
                ) : (
                  <Link
                    href="#"
                    onClick={async () => {
                      await signOut(appSnapshot.info.LOGOUT_URL, session.idToken);
                    }}
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Sign out
                  </Link>
                )}
              </div>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
      {userProfile && isProfileOpen && (
        <UserProfilePopUp isOpen={isProfileOpen} onClose={handleCloseProfile} user={userProfile} />
      )}
    </Menu>
  );
}
