import { HoverCard, Group, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MailLink from '@/components/generic/button/MailLink';
import { openUserDetailModal } from '@/components/modal/userDetail';
import { formatFullName } from '@/helpers/user';
import { User } from '@/prisma/client';
import { cn } from '@/utils/js';
import ProfileImage from './ProfileImage';

export default function UserCard({
  user,
  title,
  classNames = {},
}: {
  user?: User | null;
  title?: string;
  classNames?: {
    wrapper?: string;
    name?: string;
  };
}) {
  const [opened, { close, open }] = useDisclosure(false);

  if (!user) return null;

  const name = formatFullName(user);

  return (
    <Group justify="left">
      <HoverCard shadow="md" position="top">
        <HoverCard.Target>
          <UnstyledButton
            className={cn('cursor-help', classNames?.wrapper)}
            onMouseEnter={open}
            onMouseLeave={close}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              openUserDetailModal({ userId: user.id });
            }}
          >
            <div className={cn('text-base font-bold text-gray-700 group-hover:text-gray-900', classNames?.name)}>
              {name}
            </div>
            {title && <div className="text-sm text-gray-400 group-hover:text-gray-700">{title}</div>}
          </UnstyledButton>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <ProfileImage
            email={user.email ?? ''}
            image={user.image ?? ''}
            size={56}
            className="h-14 w-14 mx-auto mb-2"
          />
          <div className="text-center text-lg leading-6 font-bold text-gray-900 mb-2">{name}</div>
          <div className="text-center text-md">
            <MailLink to={user.email} />
          </div>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
