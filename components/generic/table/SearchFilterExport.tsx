import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Search from '@/components/assets/search.svg';
import Filter from '@/components/assets/filter.svg';
import Export from '@/components/assets/export.svg';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/utils/hooks';
import { Disclosure } from '@headlessui/react';
import { useTableState } from './Table';

type Props = {
  initialSearch?: string;
  onSearch?: (search: string) => void;
  onExport?: () => void;
  children?: React.ReactNode;
};

export default function SearchFilterExport({ initialSearch = '', onSearch, onExport, children }: Props) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams()!;

  const { state, snapshot: snap } = useTableState();
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const debouncedValue = useDebounce<string>(searchTerm, 450);

  useEffect(() => {
    if (onSearch && snap.search !== debouncedValue) {
      state.search = debouncedValue;
      onSearch(debouncedValue);
    }
  }, [onSearch, snap.search, state, debouncedValue]);

  const handleDiscloserToggle = () => {
    let opened = false;
    if (searchParams.has('openFilter')) {
      opened = searchParams.get('openFilter') === 'true';
    }

    replace(`${pathname}?openFilter=${String(!opened)}`);
  };

  return (
    <div className="w-full">
      <Disclosure defaultOpen={searchParams.get('openFilter') === 'true'}>
        <div className="flex flex-grow-0 justify-end space-x-2.5 w-full items-center">
          <div className="flex w-full justify-between items-center">
            <div className="flex-grow h-12"></div>
            {onSearch && (
              <form className="flex-grow flex-shrink max-w-sm">
                <label htmlFor="simple-search" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Image
                      alt="Search"
                      src={Search}
                      width={15}
                      height={15}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    className="w-full h-9 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block pl-9 p-1.5 dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    spellCheck={false}
                    value={searchTerm}
                    onKeyDown={(e) => {
                      // Prevent page reboot on "Enter" key press
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                </div>
              </form>
            )}
          </div>
          <Disclosure.Button
            type="button"
            className="h-9 inline-flex items-center gap-x-2 rounded-md bg-white px-3 pr-6 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={handleDiscloserToggle}
          >
            <Image alt="Filter" src={Filter} width={16} height={10} />
            <span className="md:inline hidden">Filters</span>
          </Disclosure.Button>
          {onExport && (
            <>
              <button
                onClick={() => {
                  onExport();
                }}
                type="button"
                className="h-9 inline-flex items-center gap-x-2 rounded-md bg-white px-3 pr-6 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Image alt="Export" src={Export} width={16} height={12.5} />
                <span className="md:inline hidden">Export</span>
              </button>
            </>
          )}
        </div>
        <Disclosure.Panel className="py-10 w-full flex justify-end ">{children}</Disclosure.Panel>
      </Disclosure>
    </div>
  );
}
