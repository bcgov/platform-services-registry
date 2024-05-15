import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { compareUrlsIgnoreLastSegments } from '@/helpers/path-segments';

export interface ITab {
  name: string;
  label: string;
  href: string;
  ignoreSegments?: number;
}

export default function SecondaryTabs({
  tabs,
  children,
  className,
}: {
  tabs: ITab[];
  children?: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={classNames('w-full isolate inline-flex rounded-md h-10', className)}>
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
    </div>
  );
}
