import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clusters, ministries } from '@/constants';
import { useRef } from 'react';

export default function FilterPanel() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;
  const clusterRef = useRef<HTMLSelectElement>(null);
  const ministryRef = useRef<HTMLSelectElement>(null);

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

  const clearFilters = () => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.delete('cluster');
    urlSearchParams.delete('ministry');

    if (clusterRef.current) {
      clusterRef.current.value = '';
    }
    if (ministryRef.current) {
      ministryRef.current.value = '';
    }
    replace(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <div className="flex gap-8 mr-10">
      <div className="grid auto-rows-min grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-6">
        <fieldset>
          <div className="mt-2">
            <label htmlFor="cluster" className="block text-sm font-medium leading-6 text-gray-900">
              Cluster
            </label>
            <select
              ref={clusterRef}
              id="cluster"
              name="cluster"
              autoComplete="cluster-name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              onChange={(e) => handleFilterChange('cluster', e.target.value)}
            >
              <option selected={true} disabled value="">
                Select Cluster
              </option>
              {clusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <div className="mt-2">
            <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
              Ministry
            </label>
            <select
              ref={ministryRef}
              id="ministry"
              name="ministry"
              autoComplete="cluster-name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
      </div>
      <div className="mt-2 flex items-end">
        <button
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
