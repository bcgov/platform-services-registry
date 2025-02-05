'use client';

import { Avatar, Group, Text } from '@mantine/core';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn } from '@/utils/js';

interface Props {
  data: {
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
          <Text size="sm" className="font-semibold">
            <div>
              {formatFullName(data)}
              <MinistryBadge className="ml-1" ministry={data.ministry} />
            </div>
          </Text>
          <Text size="xs" opacity={0.5}>
            {data.email}
          </Text>
        </div>
      </Group>
      {children && children}
    </>
  );
}
