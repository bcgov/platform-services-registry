'use client';

import { Avatar, Group, Tooltip, UnstyledButton } from '@mantine/core';
import { IconEdit, IconExclamationCircleFilled } from '@tabler/icons-react';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { openUserDetailModal } from '@/components/modal/userDetail';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { User } from '@/prisma/client';
import { cn } from '@/utils/js';

export type UserPickerData = Pick<User, 'email' | 'firstName' | 'lastName' | 'ministry' | 'image' | 'upn' | 'idir'> & {
  id?: string;
};

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
      upn: '',
      idir: '',
    };
  }
  const missingProps = ['UPN', 'IDIR'].filter((prop) => !data[prop.toLowerCase()]);
  const isInvalid = data.email && missingProps.length > 0;
  const invalidTooltip = isInvalid ? `The user's ${missingProps.join(' and ')} attributes are missing` : '';

  const isSavedUser = !!data.id;

  return (
    <>
      <div className="flex">
        <Tooltip label="View" disabled={!isSavedUser}>
          <Group
            gap="sm"
            className={cn({ 'cursor-pointer': isSavedUser })}
            onClick={() => (data.id ? openUserDetailModal({ userId: data.id }) : onClick?.())}
          >
            <Avatar src={getUserImageData(data.image)} size={36} radius="xl" />
            <div>
              <div className="text-sm font-semibold">
                {data.email ? (
                  <div className="flex">
                    {formatFullName(data)}
                    <MinistryBadge className="ml-1" ministry={data.ministry} />
                  </div>
                ) : (
                  onClick && <UnstyledButton className="text-gray-700 hover:underline">{text}</UnstyledButton>
                )}
              </div>
              <div className="text-xs font-semibold opacity-50">{data.email}</div>
            </div>
          </Group>
        </Tooltip>
        {isSavedUser && onClick && (
          <Tooltip label="Edit">
            <IconEdit className="ml-2 cursor-pointer edit-user-icon" onClick={onClick} />
          </Tooltip>
        )}
        {isInvalid && (
          <Tooltip label={invalidTooltip}>
            <IconExclamationCircleFilled className="ml-2 text-red-500" />
          </Tooltip>
        )}
      </div>

      {children}
    </>
  );
}
