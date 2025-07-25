'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import localFont from 'next/font/local';
import { useEffect } from 'react';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import Provider from '@/components/layouts/Provider';
import { getInfo } from '@/services/backend';
import { useAppState } from '@/states/global';
import { cn } from '@/utils/js';
import { theme } from './mantine-theme';

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Tooltip, Legend);

const bcsans = localFont({
  src: [
    {
      path: '../public/fonts/bcsans-regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/bcsans-italic.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/bcsans-bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/bcsans-bold-italic.woff',
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
    <div className={cn('flex flex-col min-h-screen', bcsans.className)}>
      <Header />
      <main className="grow">
        <div className="mt-2 mb-8 h-full mx-4 lg:mx-20">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="box-border overflow-x-hidden">
        <Provider>
          <MantineProvider withGlobalClasses withCssVariables theme={theme}>
            <Notifications position="top-right" limit={5} autoClose={2500} />
            <ModalsProvider>
              <MainBody>{children}</MainBody>
            </ModalsProvider>
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}
