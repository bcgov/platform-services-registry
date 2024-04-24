import { useSnapshot, subscribe } from 'valtio';
import { $Enums, Prisma } from '@prisma/client';
import { clusters, ministriesNames, providers, privateSortNames } from '@/constants';
import { useEffect, useRef, useState } from 'react';
import { capitalizeFirstLetter } from '@/utils/string';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);
  const clusterProviderRef = useRef<HTMLSelectElement>(null);
  const ministryRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const toggleText = 'Show Resolved Requests';

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = privateSortNames.find(
      (privateSortName) => privateSortName.humanFriendlyName === event.target.value,
    );
    if (selectedOption) {
      pageState.sortKey = selectedOption.sortKey;
      pageState.sortOrder = selectedOption.sortOrder;
    } else {
      pageState.sortKey = '';
      pageState.sortOrder = Prisma.SortOrder.desc;
    }
  };

  const handleToggleChange = () => {
    pageState.includeInactive = !pageSnapshot.includeInactive;
  };

  const handleClusterChange = (value: string) => {
    pageState.cluster = value;
  };

  const handleMinistryChange = (value: string) => {
    pageState.ministry = value;
  };

  const clearFilters = () => {
    if (clusterProviderRef.current) {
      clusterProviderRef.current.value = '';
    }
    if (ministryRef.current) {
      ministryRef.current.value = '';
    }
    if (sortRef.current) {
      sortRef.current.value = '';
    }

    pageState.cluster = '';
    pageState.ministry = '';
    pageState.sortKey = '';
    pageState.sortOrder = '';
    pageState.includeInactive = false;
  };

  return (
    <div className="flex gap-8 mr-10">
      <div className="grid auto-rows-min grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-6">
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="">
            <label htmlFor="sort" className="block text-sm font-medium leading-6 text-gray-900">
              Sort By
            </label>
            <select
              ref={sortRef}
              id="sort"
              name="sort"
              autoComplete="sort-name"
              defaultValue={
                privateSortNames.find(
                  (v) => v.sortKey === pageSnapshot.sortKey && v.sortOrder === pageSnapshot.sortOrder,
                )?.humanFriendlyName
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={handleSortChange}
            >
              <option disabled value="">
                Sort By
              </option>
              {privateSortNames.map((privateSortName) => (
                <option key={privateSortName.sortKey} value={privateSortName.humanFriendlyName}>
                  {privateSortName.humanFriendlyName}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="mt-2 md:mt-0 md:ml-4">
            <label htmlFor="cluster" className="block text-sm font-medium leading-6 text-gray-900">
              {capitalizeFirstLetter('cluster')}
            </label>
            <select
              ref={clusterProviderRef}
              defaultValue={pageSnapshot.cluster}
              id="cluster"
              name="cluster"
              autoComplete="cluster-name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => handleClusterChange(e.target.value)}
            >
              <option value="">All {capitalizeFirstLetter('cluster')}s</option>
              {clusters.map((item) => (
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
              autoComplete="ministry-name"
              defaultValue={pageSnapshot.ministry}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => handleMinistryChange(e.target.value)}
            >
              <option value="">All Ministries</option>
              {ministriesNames.map((ministry) => (
                <option key={ministry.id} value={ministry.name}>
                  {ministry.humanFriendlyName}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <div></div>
        <label className="cursor-pointer select-none flex flex-row items-center mt-8 md:mt-7 md:ml-4">
          <input
            type="checkbox"
            name="autoSaver"
            className="sr-only"
            checked={pageSnapshot.includeInactive}
            onChange={handleToggleChange}
            defaultValue={'true'}
          />
          <span
            className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200 ${
              pageSnapshot.includeInactive ? 'bg-bcblue' : 'bg-[#CCCCCE]'
            }`}
          >
            <span
              className={`dot h-[18px] w-[18px] rounded-full bg-white duration-200 ${
                pageSnapshot.includeInactive ? 'translate-x-6' : ''
              }`}
            />
          </span>
          <span className="block text-sm font-medium leading-6 text-gray-900">{toggleText}</span>
        </label>
        <div className="mt-8 md:mt-7 md:ml-4">
          <button
            className="min-w-max w-1/2 h-9 inline-flex items-center justify-center gap-x-2 rounded-md bg-bcblue text-white px-3 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all duration-500 ring-gray-300 hover:bg-[#CCCCCE]"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
