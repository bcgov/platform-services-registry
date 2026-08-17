'use client';

import { Avatar, Group, Tooltip, UnstyledButton } from '@mantine/core';
import { IconBrandGithub, IconEdit, IconExclamationCircleFilled } from '@tabler/icons-react';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { openUserDetailModal } from '@/components/modal/userDetail';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { User } from '@/prisma/client';
import { cn } from '@/utils/js';

export type UserPickerData = Pick<User, 'email' | 'firstName' | 'lastName' | 'ministry' | 'image' | 'upn' | 'idir'> & {
  id?: string;
  githubUsername?: User['githubUsername'];
};

interface Props {
  data?: UserPickerData;
  onClick?: () => void;
  text?: string;
  showEditIcon?: boolean;
  children?: React.ReactNode;
}

export default function UserProfile({
  data,
  onClick,
  text = 'Click to select member',
  showEditIcon = true,
  children,
}: Readonly<Props>) {
  const user: UserPickerData = data ?? {
    image: '',
    email: '',
    ministry: '',
    githubUsername: null,
    firstName: '',
    lastName: '',
    upn: '',
    idir: '',
  };

  const missingProps = ['UPN', 'IDIR'].filter((prop) => !user[prop.toLowerCase()]);
  const isInvalid = user.email && missingProps.length > 0;
  const invalidTooltip = isInvalid ? `The user's ${missingProps.join(' and ')} attributes are missing` : '';

  const isSavedUser = !!user.id;

  return (
    <>
      <div className="flex">
        <Tooltip label="View" disabled={!isSavedUser}>
          <Group
            gap="sm"
            className={cn({ 'cursor-pointer': isSavedUser })}
            onClick={() => (user.id ? openUserDetailModal({ userId: user.id }) : onClick?.())}
          >
            <Avatar src={getUserImageData(user.image)} size={36} radius="xl" />

            <div className="text-sm font-semibold">
              {user.email ? (
                <>
                  <div className="text-sm font-semibold">
                    <div className="flex">
                      {formatFullName(user)}
                      <MinistryBadge className="ml-1" ministry={user.ministry} />
                    </div>
                  </div>

                  <div className="text-xs font-semibold opacity-50">{user.email}</div>

                  <div className="mt-1 flex items-center text-xs font-semibold">
                    {user.githubUsername ? (
                      <>
                        <IconBrandGithub size={20} stroke={2.5} className="mr-1 shrink-0" />

                        <span className="opacity-60">{user.githubUsername}</span>
                      </>
                    ) : (
                      onClick && (
                        <UnstyledButton
                          className="text-xs text-orange-700 hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            onClick();
                          }}
                        >
                          Click to add GitHub username
                        </UnstyledButton>
                      )
                    )}
                  </div>
                </>
              ) : (
                onClick && <UnstyledButton className="text-gray-700 hover:underline">{text}</UnstyledButton>
              )}
            </div>
          </Group>
        </Tooltip>
        {isSavedUser && onClick && showEditIcon && (
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
