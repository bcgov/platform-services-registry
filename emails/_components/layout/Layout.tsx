import { Html, Head, Body } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';
import { tailwindConfig } from '../tailwind';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">{children}</div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
}
