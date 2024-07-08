import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { IconFilter, IconSearch, IconSquareX } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ExportButton from '@/components/buttons/ExportButton';
import { useDebounce } from '@/utils/hooks';
import LightButton from '../button/LightButton';
import { useTableState } from './Table';

type Props = {
  initialSearch?: string;
  onSearch?: (search: string) => void;
  onExport?: () => Promise<boolean>;
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
                    <IconSearch size={20} />
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    className="w-full h-9 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block px-9 py-1.5 dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300"
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    <IconSquareX size={20} onClick={() => setSearchTerm('')} />
                  </div>
                </div>
              </form>
            )}
          </div>
          {children && (
            <DisclosureButton as={LightButton} type="button" onClick={handleDiscloserToggle} className="pr-6">
              <IconFilter size={20} />
              Filter
            </DisclosureButton>
          )}
          {onExport && <ExportButton onExport={onExport} />}
        </div>
        <DisclosurePanel className="py-10 w-full flex justify-end ">{children}</DisclosurePanel>
      </Disclosure>
    </div>
  );
}
