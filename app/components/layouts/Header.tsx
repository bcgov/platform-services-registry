'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Logo from '@/components/assets/logo.svg';
import LightButton from '@/components/generic/button/LightButton';
import UserMenu from '@/components/layouts/UserMenu';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  let context = '';
  if (pathname.startsWith('/private-cloud')) {
    context = 'Private Cloud OpenShift Platform';
  } else if (pathname.startsWith('/public-cloud')) {
    context = 'Public Cloud Landing Zone';
  }

  return (
    <nav className="border-b-3 border-bcorange bg-bcblue shadow">
      <div style={{ height: 65 }} className="test mx-auto border-y-4 border-bcblue px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-14 justify-between px-12">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">{/* Mobile menu button */}</div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
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
            {session ? (
              <UserMenu />
            ) : (
              <LightButton onClick={() => signIn('keycloak', { callbackUrl: '/home' })}>Login</LightButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
