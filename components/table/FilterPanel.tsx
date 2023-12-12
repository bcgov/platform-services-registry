import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clusters, ministries, providers } from '@/constants';
import { useRef, useState } from 'react';

export default function FilterPanel() {
  const [showInactive, setShowInactive] = useState(false);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;
  const clusterProviderRef = useRef<HTMLSelectElement>(null);
  const ministryRef = useRef<HTMLSelectElement>(null);
  const currentClusterProvider = pathname.includes('private') ? 'Cluster' : 'Provider';
  const currentClusterProviderList = pathname.includes('private') ? clusters : providers;
  const isRequests = pathname.includes('/requests');
  const toggleText = isRequests ? 'Only Show Pending Requests' : 'Show Deleted Projects';

  const handleFilterChange = (name: string, value: string | null) => {
    const urlSearchParams = new URLSearchParams(searchParams?.toString());

    if (value) {
      urlSearchParams.set(name, value);
    } else {
      urlSearchParams.delete(name);
    }
    urlSearchParams.delete('page');

    replace(`${pathname}?${urlSearchParams.toString()}`);
  };

  const handleToggleChange = () => {
    setShowInactive(!showInactive);
    handleFilterChange('active', String(showInactive));
  };

  const clearFilters = () => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.delete(currentClusterProvider.toLowerCase());
    urlSearchParams.delete('ministry');

    if (clusterProviderRef.current) {
      clusterProviderRef.current.value = '';
    }
    if (ministryRef.current) {
      ministryRef.current.value = '';
    }
    replace(`${pathname}?${urlSearchParams.toString()}`);

    setShowInactive(false);
  };

  return (
    <div className="flex flex-col justify-between md:flex-row ">
      <div className="flex flex-col md:flex-row">
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div>
            <label
              htmlFor={currentClusterProvider.toLowerCase()}
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              {currentClusterProvider}
            </label>
            <select
              ref={clusterProviderRef}
              id={currentClusterProvider.toLowerCase()}
              name={currentClusterProvider.toLowerCase()}
              autoComplete="cluster-name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => handleFilterChange(currentClusterProvider.toLowerCase(), e.target.value)}
            >
              <option selected={true} disabled value="">
                Select {currentClusterProvider}
              </option>
              {currentClusterProviderList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="mt-2 md:mt-0 md:ml-4">
            <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
              Ministry
            </label>
            <select
              ref={ministryRef}
              id="ministry"
              name="ministry"
              autoComplete="cluster-name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => handleFilterChange('ministry', e.target.value)}
            >
              <option selected={true} disabled value="">
                Select Ministry
              </option>
              {ministries.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <label className="cursor-pointer select-none flex flex-row mt-4 md:ml-8 md:mt-7">
          <input
            type="checkbox"
            name="autoSaver"
            className="sr-only"
            checked={showInactive}
            onChange={handleToggleChange}
          />
          <span
            className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${
              showInactive ? 'bg-bcblue' : 'bg-[#CCCCCE]'
            }`}
          >
            <span
              className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${
                showInactive ? 'translate-x-6' : ''
              }`}
            />
          </span>
          <span className="block text-sm font-medium leading-6 text-gray-900">{toggleText}</span>
        </label>
      </div>
      <div className="mt-8 md:mt-7">
        <button
          className="rounded-md bg-white w-full py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 md:px-3"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
