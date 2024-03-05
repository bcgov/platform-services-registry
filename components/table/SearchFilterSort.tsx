'use client';

import Image from 'next/image';
import Search from '@/components/assets/search.svg';
import Filter from '@/components/assets/filter.svg';
import Export from '@/components/assets/export.svg';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/utils/hooks';
import FilterPanel from './FilterPanel';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import AlertBox from '@/components/modal/AlertBox';

type SearchFilterSortProps = {
  showDownloadButton?: boolean;
  apiContext?: string;
  removeSearch?: boolean;
};

export default function SearchFilterSort({
  showDownloadButton = false,
  apiContext,
  removeSearch = false,
}: SearchFilterSortProps) {
  const [focused, setFocused] = useState(false);
  const { replace } = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams()!;

  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchTerm, 450);
  const [isAlertBoxOpen, setIsAlertBoxOpen] = useState(false);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, replace, pathname],
  );

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/${apiContext}/all-projects?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (response.status === 204) {
        setIsAlertBoxOpen(true);
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
        : 'product-data.csv';
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      // Append the link, trigger the download, then clean up
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  useEffect(() => {
    if (debouncedValue == '') {
      // Remove search param
      const params = new URLSearchParams(searchParams?.toString());
      params.delete('search');
      replace(`${pathname}?${params.toString()}`);
    } else {
      handleSearch(debouncedValue);
    }
  }, [searchParams, replace, pathname, debouncedValue, handleSearch]);

  const handleCancelBox = () => {
    setIsAlertBoxOpen(false);
  };

  return (
    <div className="w-full">
      <Disclosure>
        <div className="flex flex-grow-0 justify-end space-x-2.5 w-full items-center">
          <div className="flex w-full justify-between items-center">
            <div className="flex-grow h-12"></div>
            {!removeSearch && (
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
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    spellCheck={false}
                    onKeyDown={(e) => {
                      // Prevent page reboot on "Enter" key press
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                  {isPending && (
                    <div className="absolute inset-y-0 right-0 mr-4 flex items-center pl-3 pointer-events-none">
                      <span className=" border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-t-slate-400" />
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
          <Disclosure.Button
            type="button"
            className="h-9 inline-flex items-center gap-x-2 rounded-md bg-white px-3 pr-6 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Image alt="Filter" src={Filter} width={16} height={10} />
            <span className="md:inline hidden">Filters</span>
          </Disclosure.Button>
          {showDownloadButton && (
            <button
              onClick={handleDownload}
              type="button"
              className="h-9 inline-flex items-center gap-x-2 rounded-md bg-white px-3 pr-6 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Image alt="Export" src={Export} width={16} height={12.5} />
              <span className="md:inline hidden">Export</span>
            </button>
          )}
          <AlertBox
            isOpen={isAlertBoxOpen}
            title="Nothing to export"
            message="There is no data available for download."
            onCancel={handleCancelBox}
            cancelButtonText="DISMISS"
            singleButton={true}
          />
        </div>
        <Disclosure.Panel className="py-10 w-full flex justify-end ">
          <FilterPanel />
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
}
