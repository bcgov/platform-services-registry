import { HoverCard, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { formatFullName } from '@/helpers/user';
import ProfileImage from './ProfileImage';

export default function UserCard({
  user,
  title,
  className = '',
}: {
  user?: Prisma.UserGetPayload<null> | null;
  title?: string;
  className?: string;
}) {
  const [opened, { close, open }] = useDisclosure(false);

  if (!user) return null;

  const name = formatFullName(user);

  return (
    <Group justify="center">
      <HoverCard width={280} shadow="md" position="top">
        <HoverCard.Target>
          <div className={className} onMouseEnter={open} onMouseLeave={close}>
            <div className="text-base font-bold text-gray-700 group-hover:text-gray-900 truncate">{name}</div>
            {title && <div className="text-sm text-gray-400 group-hover:text-gray-700">{title}</div>}
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <ProfileImage email={user.email ?? ''} image={user.image ?? ''} className="h-15 w-15 mx-auto mb-2" />
          <div className="text-center text-lg leading-6 font-bold text-gray-900 mb-2">{name}</div>
          <div className="text-center text-md">{user.email}</div>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
