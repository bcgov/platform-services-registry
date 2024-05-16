'use client';

import { Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import _truncate from 'lodash-es/truncate';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Empty from '@/components/assets/empty.svg';
import ActiveRequestBox from '@/components/form/ActiveRequestBox';
import CopyableButton from '@/components/generic/button/CopyableButton';
import UserCard from '@/components/UserCard';
import { ministryKeyToName } from '@/helpers/product';
import { PrivateCloudRequestSearchedItemPayload } from '@/queries/private-cloud-requests';
import { formatDate } from '@/utils/date';

export default function EmptySearch({
  cloud,
  type,
}: {
  cloud: 'private-cloud' | 'public-cloud';
  type: 'product' | 'request';
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
      <span className="text-xl font-bold text-mediumgrey mt-4">There are no {type}s to be displayed</span>
      <Link className="underline text-lg font-extralight text-linkblue mt-4" href={`/${cloud}/products/create`}>
        REQUEST A NEW PRODUCT
      </Link>
    </div>
  );
}
