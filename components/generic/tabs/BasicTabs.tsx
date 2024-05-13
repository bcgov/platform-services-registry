import classNames from 'classnames';
import _lowerCase from 'lodash-es/lowerCase';
import _startCase from 'lodash-es/startCase';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import FormSelect from '@/components/generic/select/FormSelect';
import { compareUrlsIgnoreLastSegments } from '@/helpers/path-segments';

export interface ITab {
  name: string;
  label: string;
  href: string;
  ignoreSegments?: number;
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
              {tabs.map((tab) => (
                <Link
                  href={tab.href}
                  key={tab.name}
                  className={classNames(
                    'first:ml-0 lg:ml-20 w-50 py-5 text-center font-bcsans text-lg font-bold',
                    compareUrlsIgnoreLastSegments(tab.href, pathname, tab.ignoreSegments ?? 0)
                      ? "relative border-bcorange text-bcblue before:content-[''] before:absolute before:w-full before:border-b-3 before:border-bcorange before:bottom-0 before:left-1/2 before:-translate-x-1/2"
                      : "relative border-transparent text-gray-300 hover:before:content-[''] hover:before:absolute hover:before:w-full hover:before:border-b-3 hover:before:border-gray-300 hover:before:bottom-0 hover:before:left-1/2 hover:before:-translate-x-1/2",
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
