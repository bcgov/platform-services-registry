import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { compareUrlsIgnoreLastSegments } from '@/helpers/path-segments';

export interface ITab {
  name: string;
  label: string;
  href: string;
  ignoreSegments?: number;
}

export default function Tabs({ tabs, children }: { tabs: ITab[]; children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <span className="isolate inline-flex rounded-md h-10 mb-8">
        {tabs.map((tab) => (
          <Link
            href={tab.href}
            key={tab.name}
            className={classNames(
              'pl-4 relative inline-flex items-center first:rounded-l-lg last:rounded-r-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10',
              compareUrlsIgnoreLastSegments(tab.href, pathname, tab.ignoreSegments ?? 0)
                ? 'bg-bcblue text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </span>
    </div>
  );
}
