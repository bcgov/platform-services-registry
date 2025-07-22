'use client';

import { Menu, UnstyledButton } from '@mantine/core';
import {
  IconUserCircle,
  IconApi,
  IconBuilding,
  IconVirusSearch,
  IconScan,
  IconUsersGroup,
  IconPresentationAnalytics,
  IconLogout,
  IconProps,
  Icon,
  IconCalendarEvent,
  IconSignLeft,
  IconCheckupList,
  IconClockDollar,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Permissions } from 'next-auth';
import { useSession } from 'next-auth/react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { openUserProfileModal } from '@/components/modal/userProfile';
import { GlobalPermissions } from '@/constants';
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

  if (!session) return null;
  if (!session.user.id) {
    signOut(appSnapshot.info.LOGOUT_URL, session.idToken);
    return;
  }

  const { permissions } = session;

  const menus: MenuType[] = [
    {
      text: 'Profile',
      Icon: IconUserCircle,
      onClick: () => {
        openUserProfileModal({ session });
      },
    },
    {
      text: 'My API Account',
      Icon: IconApi,
      href: '/api-account',
    },
    {
      text: 'Team API Accounts',
      Icon: IconApi,
      href: '/team-api-accounts',
    },
    {
      text: 'Organizations',
      Icon: IconBuilding,
      href: '/organizations',
      permission: 'viewOrganizations',
    },
    {
      text: 'Users',
      Icon: IconUsersGroup,
      href: '/users/all',
      permission: 'viewUsers',
    },
    {
      text: 'Events',
      Icon: IconCalendarEvent,
      href: '/events/all',
      permission: 'viewEvents',
    },
    {
      text: 'Tasks',
      Icon: IconCheckupList,
      href: '/tasks/all',
      permission: 'viewTasks',
    },
    {
      text: 'Private Cloud Unit Prices',
      Icon: IconClockDollar,
      href: '/private-cloud/unit-prices/all',
      permission: GlobalPermissions.ViewPrivateCloudUnitPrices,
    },
    {
      text: 'Private Cloud Billings',
      Icon: IconSignLeft,
      href: '/private-cloud/billings/all',
      permission: 'viewPrivateCloudBilling',
    },
    {
      text: 'Public Cloud Billings',
      Icon: IconSignLeft,
      href: '/public-cloud/billings/all',
      permission: 'viewPublicCloudBilling',
    },
    {
      text: 'General Analytics',
      Icon: IconPresentationAnalytics,
      href: '/analytics/general',
      permission: 'viewPrivateAnalytics',
    },
    {
      text: 'Private Cloud Analytics',
      Icon: IconPresentationAnalytics,
      href: '/analytics/private-cloud',
      permission: 'viewPrivateAnalytics',
    },
    {
      text: 'Public Cloud Analytics',
      Icon: IconPresentationAnalytics,
      href: '/analytics/public-cloud',
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
    </>
  );
}
