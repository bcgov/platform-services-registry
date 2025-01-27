import { Tooltip } from '@mantine/core';
import _lowerCase from 'lodash-es/lowerCase';
import _startCase from 'lodash-es/startCase';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import FormSelect from '@/components/generic/select/FormSelect';
import { compareUrlsIgnoreLastSegments } from '@/helpers/path-segments';
import { cn } from '@/utils/js';

export interface ITab {
  name: string;
  label: string;
  href: string;
  ignoreSegments?: number;
  tooltip?: string;
}

export default function BasicTabs({ tabs, children }: { tabs: ITab[]; children?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((tab) => compareUrlsIgnoreLastSegments(tab.href, pathname));

  return (
    <div className="w-full">
      <div className="md:hidden">
        <FormSelect
          id="tabs"
          label="Select a tab"
          options={tabs.map((v) => ({ label: _startCase(_lowerCase(v.label)), value: v.name }))}
          defaultValue={currentTab?.name}
          className={{ label: 'sr-only', input: '' }}
          onChange={(value) => {
            const t = tabs.find((tab) => tab.name === value);
            if (t) router.push(t.href);
          }}
        />
      </div>
      <div className="hidden md:block justify-start">
        <div className="border-b border-gray-200">
          <div className="w-full -mb-px flex justify-between items-center" aria-label="Tabs">
            <div className=" -mb-px flex justify-start">
              {tabs.map((tab) => {
                const linkingClassNames = cn(
                  "first:ml-0 lg:ml-10 mt-2 py-2 px-3 text-center text-lg font-bold relative before:content-[''] before:absolute before:w-full before:border-b-3 before:bottom-0 before:left-1/2 before:-translate-x-1/2 rounded-xl hover:bg-gray-100 transition-colors duration-200",
                  compareUrlsIgnoreLastSegments(tab.href, pathname, tab.ignoreSegments ?? 0)
                    ? 'text-bcblue before:border-bcorange'
                    : 'text-gray-500 hover:text-gray-700 hover:before:border-gray-500',
                );
                const linkingComponent = (
                  <Link href={tab.href} key={tab.name} className={linkingClassNames}>
                    {tab.label}
                  </Link>
                );
                return tab.tooltip ? (
                  <Tooltip label={tab.tooltip} key={tab.name}>
                    {linkingComponent}
                  </Tooltip>
                ) : (
                  linkingComponent
                );
              })}
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
