'use client';

import Link from 'next/link';
import classNames from '@/components/utils/classnames';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    name: 'Admins',
    href: 'Admins',
  },
  {
    name: 'Billing Viewers',
    href: '/BillingViewers',
  },
  {
    name: 'Developers',
    href: '/Developers',
  },
  {
    name: 'Security Auditors',
    href: '/SecurityAuditors',
  },
  {
    name: 'Viewers',
    href: '/Viewers',
  },
];

export default function PublicUsersTabs() {
  const pathname = usePathname();
  return (
    <div>
      <span className="isolate inline-flex rounded-md shadow-sm py-2 px-4">
        {tabs.map((tab, index) => (
          <Link
            key={index}
            href={`${pathname.split('/').splice(0, 5).join('/')}/${tab.href}`}
            type="button"
            className={classNames(
              (pathname.split('/').includes(tab.href) ? 'bg-gray-200 hover:none' : 'bg-white hover:bg-gray-100') +
                (index === 0 ? ' rounded-l-lg' : '') +
                (index === tabs.length - 1 ? ' rounded-r-lg' : '') +
                ' w-24 relative inline-flex justify-center items-center  px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-10',
            )}
          >
            {tab.name}
          </Link>
        ))}
      </span>
    </div>
  );
}
