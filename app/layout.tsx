'use client';

import 'react-toastify/dist/ReactToastify.css';
import '@mantine/core/styles.css';
import './globals.css';
import { MantineProvider } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import localFont from 'next/font/local';
import { useEffect } from 'react';
import Footer from '@/components/Footer';
import Nav from '@/components/nav/Nav';
import Provider from '@/components/Provider';
import { getInfo } from '@/services/backend';
import { useAppState } from '@/states/global';

const bcsans = localFont({
  src: [
    {
      path: '../fonts/bcsans-regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/bcsans-regular.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/bcsans-bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/bcsans-bold.woff',
      weight: '700',
      style: 'italic',
    },
  ],
});

function MainBody({ children }: { children: React.ReactNode }) {
  const [appState, appSnapshot] = useAppState();

  const { data: info } = useQuery({
    queryKey: ['info'],
    queryFn: () => getInfo(),
  });

  useEffect(() => {
    if (info) appState.info = info;
  }, [appState, info]);

  return (
    <body className={classNames('flex flex-col min-h-screen', bcsans.className)}>
      <Nav />
      <main className="flex-grow h-100">
        <div className="mt-2 mb-2 h-full mx-4 lg:mx-20">{children}</div>
      </main>
      <Footer />
    </body>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <Provider>
        <MainBody>
          <MantineProvider theme={{}}>{children}</MantineProvider>
        </MainBody>
      </Provider>
    </html>
  );
}
