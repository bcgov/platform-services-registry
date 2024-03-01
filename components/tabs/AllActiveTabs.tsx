'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from '@/utils/classnames';

export default function Tabs() {
  const pathname = usePathname();

  const selectedTab = pathname.split('/')[3];
  const isProducts = pathname.split('/')[2] === 'products';

  if (!isProducts) {
    return null;
  }

  return (
    <div>
      <span className="isolate inline-flex rounded-md shadow-sm m-1">
        <Link
          href={`/${pathname.split('/')[1]}/products/all`}
          type="button"
          className={classNames(
            'w-24 relative inline-flex justify-center items-center rounded-l-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-10',
            selectedTab === 'all' ? 'bg-gray-200 hover:none' : 'bg-white hover:bg-gray-100',
          )}
        >
          Products
        </Link>

        <Link
          href={`/${pathname.split('/')[1]}/products/active-requests`}
          type="button"
          className={classNames(
            'w-28 relative -ml-px inline-flex justify-center items-center rounded-r-lg  px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10',
            selectedTab === 'active-requests' ? 'bg-gray-200 hover:none' : 'bg-white hover:bg-gray-100 ',
          )}
        >
          In Progress
        </Link>
      </span>
    </div>
  );
}
