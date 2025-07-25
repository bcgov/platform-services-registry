'use client';

import { Button, Loader } from '@mantine/core';
import { IconLogin2 } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Logo from '@/components/assets/logo.svg';
import UserMenu from '@/components/layouts/UserMenu';
import SideTasks from './SideTasks';

function loginWithRedirect(defaultPath = '/home') {
  const stored = localStorage.getItem('postLoginRedirect');
  const path = stored ? stored : defaultPath;

  signIn('keycloak', { callbackUrl: path });
}

export default function Header() {
  const { data: session, status: sessionStatus } = useSession();
  const pathname = usePathname();

  let context = '';
  if (pathname.startsWith('/private-cloud')) {
    context = 'Private Cloud OpenShift platform';
  } else if (pathname.startsWith('/public-cloud')) {
    context = 'Public Cloud Landing Zone';
  }

  let rightSection = <Loader color="blue" type="dots" />;
  if (sessionStatus !== 'loading') {
    rightSection = session ? (
      <>
        <SideTasks className="mr-3" />
        <UserMenu />
      </>
    ) : (
      <Button
        color="dark"
        variant="outline"
        leftSection={<IconLogin2 />}
        className="bg-white hover:bg-white"
        onClick={() => loginWithRedirect()}
      >
        Login
      </Button>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b-3 border-bcorange bg-bcblue shadow-sm">
      <div style={{ height: 65 }} className="test mx-auto border-y-4 border-bcblue px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-14 justify-between px-12">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">{/* Mobile menu button */}</div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link href={'/home'}>
                <Image
                  alt="BC Platform Services Product Registry"
                  src={Logo}
                  width={56}
                  height={50}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Link>
              <span className="ml-5 hidden items-center text-2xl leading-none text-white md:inline">
                <span className="mr-2 font-roboto font-thin">BC Platform Services</span>
                <span className="font-roboto font-normal">Product Registry</span>
                {context !== '' && <span className="ml-2 font-normal">- {context}</span>}
              </span>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {rightSection}
          </div>
        </div>
      </div>
    </nav>
  );
}
