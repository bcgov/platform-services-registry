'use client';

import Link from 'next/link';
import classNames from '@/components/utils/classnames';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    name: 'ADMINS',
    href: 'admins',
  },
  {
    name: 'BILLING VIEWERS',
    href: 'billing-viewers',
  },
  {
    name: 'DEVELOPERS',
    href: 'developers',
  },
  {
    name: 'SECURITY AUDITORS',
    href: 'security-auditors',
  },
  {
    name: 'VIEWERS',
    href: 'viewers',
  },
];

export default function Tabs({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {/* <div className="md:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="font-bcsans text-xl block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs[0]?.name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden md:block  justify-start">
        <div className="border-b border-gray-200">
          <div className="w-full -mb-px flex justify-between items-center" aria-label="Tabs">
            <div className=" -mb-px flex justify-start">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={`/${pathname}/${tab.href}`}
                  className={classNames(
                    pathname.split('/').indexOf(tab.href) !== -1
                      ? "relative border-bcorange text-bcblue before:content-[''] before:absolute before:w-2/4 before:border-b-3 before:border-bcorange before:bottom-0 before:left-1/2 before:-translate-x-1/2"
                      : "relative border-transparent text-gray-300 hover:before:content-[''] hover:before:absolute hover:before:w-2/4 hover:before:border-b-3 hover:before:border-gray-300 hover:before:bottom-0 hover:before:left-1/2 hover:before:-translate-x-1/2",
                    'lg:ml-20 w-50 py-5 text-center font-bcsans text-lg font-bold',
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
