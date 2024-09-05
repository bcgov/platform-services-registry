'use client';

import _truncate from 'lodash-es/truncate';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Empty from '@/components/assets/empty.svg';

export default function EmptySearch({
  cloud,
  type,
}: {
  cloud: 'private-cloud' | 'public-cloud';
  type: 'product' | 'request' | 'comments' | 'notes';
}) {
  let displayText = '';

  switch (type) {
    case 'comments':
      displayText = 'There are no comments to be displayed';
      break;
    case 'notes':
      displayText = 'There are no notes to be displayed';
      break;
    case 'product':
      displayText = 'There are no products to be displayed';
      break;
    case 'request':
      displayText = 'There are no requests to be displayed';
      break;
  }

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
      <span className="text-xl font-bold text-mediumgrey mt-4">{displayText}</span>
      {type === 'product' && (
        <Link className="underline text-lg font-extralight text-linkblue mt-4" href={`/${cloud}/products/create`}>
          REQUEST A NEW PRODUCT
        </Link>
      )}
    </div>
  );
}
