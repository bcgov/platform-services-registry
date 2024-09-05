'use client';

import _truncate from 'lodash-es/truncate';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Empty from '@/components/assets/empty.svg';

const displayTextMap: Record<'product' | 'request' | 'comments' | 'notes', string> = {
  comments: 'There are no comments to be displayed',
  notes: 'There are no notes to be displayed',
  product: 'There are no products to be displayed',
  request: 'There are no requests to be displayed',
};

export default function EmptySearch({
  cloud,
  type,
}: {
  cloud: 'private-cloud' | 'public-cloud';
  type: 'product' | 'request' | 'comments' | 'notes';
}) {
  const displayText = displayTextMap[type];

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
