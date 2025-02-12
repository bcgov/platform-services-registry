'use client';

import { Avatar, Group, UnstyledButton } from '@mantine/core';
import { User } from '@prisma/client';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn } from '@/utils/js';

export type UserPickerData = Pick<User, 'email' | 'firstName' | 'lastName' | 'ministry' | 'image'> & { id?: string };

interface Props {
  data?: UserPickerData;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function UserProfile({ data, onClick, children }: Props) {
  if (!data) {
    data = {
      image: '',
      email: '',
      ministry: '',
      firstName: '',
      lastName: '',
    };
  }

  return (
    <>
      <Group gap="sm" className={cn({ 'cursor-pointer': !!onClick })} onClick={onClick}>
        <Avatar src={getUserImageData(data.image)} size={36} radius="xl" />
        <div>
          <div className="text-sm font-semibold">
            {data.email ? (
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
