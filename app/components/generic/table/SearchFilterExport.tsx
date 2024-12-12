import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { UnstyledButton, Tooltip, ComboboxData } from '@mantine/core';
import { IconFilter, IconSearch, IconCircleX } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ExportButton from '@/components/buttons/ExportButton';
import LightButton from '@/components/generic/button/LightButton';
import FormSingleSelect from '@/components/generic/select/FormSingleSelect';
import { useDebounce } from '@/utils/react';

type Props = {
  initialSearch?: string;
  onSort?: (sortKey: string) => void;
  sortOptions?: ComboboxData;
  sortKey?: string;
  onSearch?: (searchKey: string) => void;
  onExport?: () => Promise<boolean>;
  children?: React.ReactNode;
};

export default function SearchFilterExport({
  initialSearch = '',
  onSort,
  sortOptions = [],
  sortKey = '',
  onSearch,
  onExport,
  children,
}: Props) {
  const [searchKey, setSearchKey] = useState(initialSearch);
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams()!;
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const debouncedValue = useDebounce<string>(searchTerm, 450);

  useEffect(() => {
    if (searchKey !== debouncedValue) {
      setSearchKey(debouncedValue);
      if (onSearch) onSearch(debouncedValue);
    }
  }, [onSearch, searchKey, setSearchKey, debouncedValue]);

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
        <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-6">
          <div className="col-span-6">
            {onSort && (
              <FormSingleSelect
                name="sortby"
                value={sortKey}
                data={sortOptions}
                onChange={(value) => {
                  if (!value) return;
                  onSort(value);
                }}
              />
            )}
          </div>
          <div className="col-span-6 flex">
            <div className="ml-auto" />
            {onSearch && (
              <div className="flex-grow flex-shrink max-w-sm">
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
                    ref={searchRef}
                    className="w-full h-9 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block px-9 py-1.5 dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    maxLength={30}
                    spellCheck={false}
                    value={searchTerm}
                    onKeyDown={(e) => {
                      // Prevent page reboot on "Enter" key press
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                  {searchTerm && (
                    <Tooltip label="Clear Search" offset={10}>
                      <UnstyledButton
                        className="absolute inset-y-0 right-0 pr-3"
                        onClick={() => {
                          setSearchTerm('');
                          searchRef.current?.focus();
                        }}
                      >
                        <IconCircleX size={20} />
                      </UnstyledButton>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
            {children && (
              <DisclosureButton as={LightButton} type="button" onClick={handleDiscloserToggle} className="ml-2 pr-6">
                <IconFilter size={20} />
                Filter
              </DisclosureButton>
            )}
            {onExport && <ExportButton onExport={onExport} className="ml-2" />}
          </div>
        </div>
        <DisclosurePanel className="mt-2">{children}</DisclosurePanel>
      </Disclosure>
    </div>
  );
}
