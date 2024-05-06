import * as React from 'react';
import { Head, Html } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { tailwindConfig } from './tailwind';

const TailwindWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        {/* tag <head /> is needed according to Tailwind specification */}
        <Head />
        {children}
      </Tailwind>
    </Html>
  );
};

export default TailwindWrapper;
