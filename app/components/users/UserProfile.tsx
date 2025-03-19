'use client';

import { Avatar, Group, Tooltip, UnstyledButton } from '@mantine/core';
import { User } from '@prisma/client';
import { IconEdit } from '@tabler/icons-react';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { openUserDetailModal } from '@/components/modal/userDetail';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn } from '@/utils/js';

export type UserPickerData = Pick<User, 'email' | 'firstName' | 'lastName' | 'ministry' | 'image'> & { id?: string };

interface Props {
  data?: UserPickerData;
  onClick?: () => void;
  text?: string;
  children?: React.ReactNode;
}

export default function UserProfile({ data, onClick, text = 'Click to select member', children }: Props) {
  if (!data) {
    data = {
      image: '',
      email: '',
      ministry: '',
      firstName: '',
      lastName: '',
    };
  }

  const isSavedUser = !!data.id;

  return (
    <>
      <Tooltip label="Edit" disabled={!(onClick && data.email)}>
        <Group
          gap="sm"
          className={cn({ 'cursor-pointer': !!onClick || isSavedUser })}
          onClick={
            onClick ||
            function () {
              if (data.id) openUserDetailModal({ userId: data.id });
            }
          }
        >
          <Avatar src={getUserImageData(data.image)} size={36} radius="xl" />
          <div>
            <div className="text-sm font-semibold">
              {data.email ? (
                <div className="flex">
                  {formatFullName(data)}
                  <MinistryBadge className="ml-1" ministry={data.ministry} />
                  {onClick && <IconEdit className="ml-2 cursor-pointer" onClick={onClick} />}
                </div>
              ) : (
                onClick && <UnstyledButton className="text-gray-700 hover:underline">{text}</UnstyledButton>
              )}
            </div>
            <div className="text-xs font-semibold opacity-50">{data.email}</div>
          </div>
        </Group>
      </Tooltip>
      {children}
    </>
  );
}
