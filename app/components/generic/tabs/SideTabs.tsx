import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface ITab {
  value: string;
  label: string;
  href: string;
}

export default function SideTabs({ tabs, children }: { tabs: ITab[]; children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600"
      id="dropdown"
    >
      <ul className="py-1" role="none">
        {tabs.map((tab) => (
          <li key={tab.value}>
            <Link
              href={tab.href}
              className={classNames('block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-black', {
                'bg-[#003366] text-white font-semibold': tab.href === pathname,
              })}
              role="menuitem"
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}
