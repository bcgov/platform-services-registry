import { Html, Head, Font, Body } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import { BASE_URL } from '@/config';
import { tailwindConfig } from '../tailwind';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head>
          <Font
            fontFamily="BCSans"
            fallbackFontFamily="Verdana"
            webFont={{
              url: `${BASE_URL}/fonts/bcsans-regular.woff`,
              format: 'woff',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="BCSans"
            fallbackFontFamily="Verdana"
            webFont={{
              url: `${BASE_URL}/fonts/bcsans-italic.woff`,
              format: 'woff',
            }}
            fontWeight={400}
            fontStyle="italic"
          />
          <Font
            fontFamily="BCSans"
            fallbackFontFamily="Verdana"
            webFont={{
              url: `${BASE_URL}/fonts/bcsans-bold.woff`,
              format: 'woff',
            }}
            fontWeight={700}
            fontStyle="normal"
          />
          <Font
            fontFamily="BCSans"
            fallbackFontFamily="Verdana"
            webFont={{
              url: `${BASE_URL}/fonts/bcsans-bold-italic.woff`,
              format: 'woff',
            }}
            fontWeight={700}
            fontStyle="italic"
          />
        </Head>
        <div className="border border-solid border-[#eaeaea] rounded-sm my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">{children}</div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
}
