'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import Empty from '@/components/assets/empty.svg';

export default function EmptySearch({
  children,
  message = 'There are no items to be displayed',
}: {
  children?: ReactNode;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 mt-12">
      <Image
        alt="Empty"
        src={Empty}
        width={172}
        height={128}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <span className="text-xl font-bold text-mediumgrey mt-4">{message}</span>
      {children}
    </div>
  );
}
