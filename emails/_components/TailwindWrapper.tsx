import * as React from 'react';
import { Head, Html, Body } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { TailwindConfig } from './TailwindConfig';

const TailwindWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <Head />
        <Body>{children}</Body>
      </Tailwind>
    </Html>
  );
};

export default TailwindWrapper;
