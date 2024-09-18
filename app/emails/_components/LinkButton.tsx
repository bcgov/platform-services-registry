import { Button } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';

export default function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button href={`${BASE_URL}${href}`} className="bg-bcorange rounded-md px-4 py-2 text-white">
      {children}
    </Button>
  );
}
