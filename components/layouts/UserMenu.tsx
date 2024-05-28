'use client';

import { Menu, UnstyledButton } from '@mantine/core';
import {
  IconUserCircle,
  IconApi,
  IconVirusSearch,
  IconScan,
  IconPresentationAnalytics,
  IconLogout,
  IconProps,
  Icon,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Permissions } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useState, ForwardRefExoticComponent, RefAttributes } from 'react';
import UserProfile from '@/components/dropdowns/UserProfile';
import { signOut } from '@/helpers/auth';
import { useAppState } from '@/states/global';
import ProfileImage from '../ProfileImage';

type IconType = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

interface DividerMenu {
  divider: boolean;
  key: string;
}

interface LinkMenu {
  text: string;
  Icon: IconType;
  href: string;
  permission?: keyof Permissions;
}

interface ClickMenu {
  text: string;
  Icon: IconType;
  onClick?: () => void | Promise<void>;
  permission?: keyof Permissions;
}

type MenuType = DividerMenu | LinkMenu | ClickMenu;

const isDividerMenu = (menu: MenuType): menu is DividerMenu => 'divider' in menu;
const isLinkMenu = (menu: MenuType): menu is LinkMenu => 'href' in menu;
const isClickMenu = (menu: MenuType): menu is ClickMenu => 'onClick' in menu;

export default function UserMenu() {
  const [, appSnapshot] = useAppState();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!session) return null;
  const { permissions } = session;

  const menus: MenuType[] = [
    {
      text: 'Profile',
      Icon: IconUserCircle,
      onClick: () => setProfileOpen(true),
    },
    {
      text: 'API Account',
      Icon: IconApi,
      href: '/api-account',
    },
    {
      text: 'Private Cloud Analytics',
      Icon: IconPresentationAnalytics,
      href: '/private-cloud/analytics',
      permission: 'viewPrivateAnalytics',
    },
    {
      text: 'Public Cloud Analytics',
      Icon: IconPresentationAnalytics,
      href: '/public-cloud/analytics',
      permission: 'viewPublicAnalytics',
    },
    {
      text: 'Zap Scan Results',
      Icon: IconVirusSearch,
      href: '/zapscan/results',
      permission: 'viewZapscanResults',
    },
    {
      text: 'Sonar Scan Results',
      Icon: IconScan,
      href: '/sonarscan/results',
      permission: 'viewSonarscanResults',
    },
    { divider: true, key: '1' },
    {
      text: 'Sign Out',
      Icon: IconLogout,
      onClick: () => signOut(appSnapshot.info.LOGOUT_URL, session.idToken),
    },
  ];

  return (
    <>
      <Menu shadow="md">
        <Menu.Target>
          <UnstyledButton>
            <ProfileImage email={session?.user.email ?? ''} image={session?.user.image ?? ''} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          {menus.map((menu, index) => {
            if (isDividerMenu(menu)) return <Menu.Divider key={`divider-${menu.key}`} />;
            if (menu.permission && !permissions[menu.permission]) return null;

            if (isLinkMenu(menu)) {
              return (
                <Menu.Item key={menu.text} component={Link} href={menu.href} leftSection={<menu.Icon size={20} />}>
                  {menu.text}
                </Menu.Item>
              );
            }

            if (isClickMenu(menu)) {
              return (
                <Menu.Item key={menu.text} leftSection={<menu.Icon size={20} />} onClick={menu.onClick}>
                  {menu.text}
                </Menu.Item>
              );
            }

            return null;
          })}
        </Menu.Dropdown>
      </Menu>
      {session && profileOpen && <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />}
    </>
  );
}
