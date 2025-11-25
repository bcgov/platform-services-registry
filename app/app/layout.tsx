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
import { appState as appGlobalState, useAppState } from '@/states/global';
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

const additionalMinistryOptions = [
  {
    value: 'PSFS',
    label: 'Post Secondary Education and Future Skills',
  },
  {
    value: 'MOTI',
    label: 'Transportation and Infrastructure',
  },
  {
    value: 'EHS',
    label: 'Emergency Health Services',
  },
  {
    value: 'ISMC',
    label: 'International Student Ministries Canada',
  },
];

function MainBody({ children }: { children: React.ReactNode }) {
  const [, appSnapshot] = useAppState();

  const { data: info } = useQuery({
    queryKey: ['info'],
    queryFn: () => getInfo(),
  });

  useEffect(() => {
    if (!info) return;

    const orgOptions = info.ORGANIZATIONS.map(({ id, name }) => ({
      label: name,
      value: id,
    }));

    const orgSearchOptions = info.ORGANIZATIONS.map(({ code, name }) => ({
      label: name,
      value: code,
    }));

    const orgById: Record<string, any> = {};
    for (const org of info.ORGANIZATIONS) {
      orgById[org.id] = org;
    }

    const nameByCode: Record<string, string> = {};
    for (const org of [...info.ORGANIZATIONS, ...additionalMinistryOptions]) {
      nameByCode[org.code] = org.name;
    }

    const derivedInfo = {
      ...info,
      ORGANIZATION_OPTIONS: orgOptions,
      ORGANIZATION_SEARCH_OPTIONS: orgSearchOptions,
      ORGANIZATION_BY_ID: orgById,
      ORGANIZATION_NAME_BY_CODE: nameByCode,
    };
    appGlobalState.info = derivedInfo;
  }, [info]);

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
