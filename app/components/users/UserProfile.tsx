'use client';

import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn } from '@/utils/js';

interface Props {
  data: {
    id?: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    ministry: string | null;
    image: string | null;
  };
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function UserProfile({ data, onClick, children }: Props) {
  return (
    <>
      <Group gap="sm" className={cn({ 'cursor-pointer': !!onClick })} onClick={onClick}>
        <Avatar src={getUserImageData(data.image)} size={36} radius="xl" />
        <div>
          <div className="text-sm font-semibold">
            {data.id ? (
              <div>
                {formatFullName(data)}
                <MinistryBadge className="ml-1" ministry={data.ministry} />
              </div>
            ) : (
              onClick && (
                <UnstyledButton className="text-gray-700 hover:underline">Click to select member</UnstyledButton>
              )
            )}
          </div>
          <div className="text-xs font-semibold opacity-50">{data.email}</div>
        </div>
      </Group>
      {children}
    </>
  );
}
