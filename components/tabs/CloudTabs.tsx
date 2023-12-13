'use client';

import Link from 'next/link';
import classNames from '@/components/utils/classnames';
import { usePathname } from 'next/navigation';
import CreateButton from '@/components/buttons/CreateButton';

interface Tab {
  name: string;
  href: string;
  subHref: string;
}

interface Tab {
  name: string;
  href: string;
  subHref: string;
}

const createLink = (path: string[], elem: string): string[] => {
  path.splice(path.length - 1, 1, elem);
  return path;
};

export default function Tabs({ tabs }: { tabs: Tab[] }, { className }: { className?: string }) {
  const pathname = usePathname();
  const getTabLinkURL = (tab: Tab): string => {
    if (tab.href) {
      return `/${tab.href}/${pathname.split('/').slice(2).join('/')}`;
    }
    if (tab.subHref) {
      return createLink(pathname.split('/'), tab.subHref).join('/');
    }
    return '';
  };

  const cloud = `${pathname.split('/')[2]}`;

  return (
    <div className="w-full">
      <div className="md:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
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
                  href={getTabLinkURL(tab)}
                  className={classNames(
                    (tab.href && pathname.split('/')[1] === tab.href) ||
                      (tab.subHref && pathname.split('/')[pathname.split('/').length - 1] === tab.subHref)
                      ? "relative border-bcorange text-bcblue before:content-[''] before:absolute before:w-2/4 before:border-b-3 before:border-bcorange before:bottom-0 before:left-1/2 before:-translate-x-1/2"
                      : "relative border-transparent text-gray-300 hover:before:content-[''] hover:before:absolute hover:before:w-2/4 hover:before:border-b-3 hover:before:border-gray-300 hover:before:bottom-0 hover:before:left-1/2 hover:before:-translate-x-1/2",
                    'lg:ml-20 w-50 py-5 text-center font-bcsans text-lg font-bold',
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
            <CreateButton />
          </div>
        </div>
      </div>
    </div>
  );
}
