import * as React from 'react';
import { Head, Html } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { TailwindConfig } from './TailwindConfig';

const TailwindWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        {/* tag <head /> is needed according to Tailwind specification */}
        <Head />
        {children}
      </Tailwind>
    </Html>
  );
};

export default TailwindWrapper;
