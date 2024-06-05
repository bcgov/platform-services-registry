'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import localFont from 'next/font/local';
import { useEffect } from 'react';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import Provider from '@/components/layouts/Provider';
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
      <Header />
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
      <MantineProvider withGlobalClasses={false} withCssVariables theme={{}}>
        <Notifications position="top-right" limit={5} autoClose={2500} />
        <ModalsProvider>
          <Provider>
            <MainBody>{children}</MainBody>
          </Provider>
        </ModalsProvider>
      </MantineProvider>
    </html>
  );
}
