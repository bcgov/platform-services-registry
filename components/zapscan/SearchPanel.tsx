'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Select, { MultiValue } from 'react-select';
import _throttle from 'lodash-es/throttle';
import _isEqual from 'lodash-es/isEqual';
import _castArray from 'lodash-es/castArray';
import { parseQueryString, stringifyQuery, isSearchQueryEqual } from '@/lib/query-string';
import Search from '@/components/assets/search.svg';

export default function SearchPanel({ clusters }: { clusters: string[] }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClusters, setSelectedClusters] = useState<string[]>(searchParams.getAll('cluster'));

  const throttled = useRef(
    _throttle((r, newUrl) => startTransition(() => r(newUrl, { scroll: false })), 1000, { trailing: true }),
  );

  const handleClusterChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    setSelectedClusters(newValue.map((val) => val.value));
  };

  useEffect(() => {
    const currParamObj = parseQueryString(searchParams?.toString());
    const hasFilterChanged =
      !_isEqual(currParamObj.search || '', searchTerm || '') ||
      !_isEqual(_castArray(currParamObj.cluster || []), selectedClusters || []);

    const newParamObj = {
      ...currParamObj,
      page: hasFilterChanged ? 1 : currParamObj.page,
      search: searchTerm || '',
      cluster: selectedClusters,
    };

    if (pathname.endsWith('/zapscan')) return;
    if (isSearchQueryEqual(currParamObj, newParamObj)) return;

    const newParams = stringifyQuery(newParamObj);
    throttled.current(replace, `${pathname}?${newParams}`);
  }, [replace, pathname, searchParams, searchTerm, selectedClusters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-2">
      <div className="hidden md:block col-span-3"></div>
      <div className="col-span-1">
        <Select
          placeholder="Select Clusters..."
          isMulti
          options={clusters.map((cluster) => ({ value: cluster, label: cluster }))}
          defaultValue={searchParams.getAll('cluster').map((cluster) => ({ value: cluster, label: cluster }))}
          onChange={handleClusterChange}
        />
      </div>
      <div className="col-span-2 relative">
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
          spellCheck={false}
        />
      </div>
    </div>
  );
}
