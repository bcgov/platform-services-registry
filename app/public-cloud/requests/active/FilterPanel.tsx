import { useSnapshot, subscribe } from 'valtio';
import { $Enums, Prisma } from '@prisma/client';
import { clusters, ministriesNames, providers, productSorts } from '@/constants';
import { useEffect, useRef, useState } from 'react';
import { capitalizeFirstLetter } from '@/utils/string';
import FormSelect from '@/components/generic/select/FormSelect';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);
  const providerProviderRef = useRef<HTMLSelectElement>(null);
  const ministryRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const toggleText = 'Show Resolved Requests';

  const handleSortChange = (value: string) => {
    const selectedOption = productSorts.find((privateSortName) => privateSortName.humanFriendlyName === value);
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

  const handleProviderChange = (value: string) => {
    pageState.provider = value;
  };

  const handleMinistryChange = (value: string) => {
    pageState.ministry = value;
  };

  const clearFilters = () => {
    if (providerProviderRef.current) {
      providerProviderRef.current.value = '';
    }
    if (ministryRef.current) {
      ministryRef.current.value = '';
    }
    if (sortRef.current) {
      sortRef.current.value = '';
    }

    pageState.provider = '';
    pageState.ministry = '';
    pageState.sortKey = '';
    pageState.sortOrder = '';
    pageState.includeInactive = false;
  };

  return (
    <div className="flex gap-8 mr-10">
      <div className="grid auto-rows-min grid-cols-1 gap-y-8 md:grid-cols-3 md:gap-x-6">
        <fieldset className="w-full md:w-48 2xl:w-96">
          <FormSelect
            ref={sortRef}
            id="id"
            label="Sort By"
            options={productSorts.map((v) => ({ label: v.humanFriendlyName, value: v.humanFriendlyName }))}
            defaultValue={
              productSorts.find((v) => v.sortKey === pageSnapshot.sortKey && v.sortOrder === pageSnapshot.sortOrder)
                ?.humanFriendlyName
            }
            onChange={handleSortChange}
          />
        </fieldset>
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="mt-2 md:mt-0 md:ml-4">
            <FormSelect
              ref={providerProviderRef}
              id="provider"
              label="Provider"
              options={[{ label: 'All Providers', value: '' }, ...providers.map((v) => ({ label: v, value: v }))]}
              defaultValue={pageSnapshot.provider}
              onChange={handleProviderChange}
            />
          </div>
        </fieldset>
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="mt-2 md:mt-0 md:ml-4">
            <FormSelect
              ref={ministryRef}
              id="ministry"
              label="Ministry"
              options={[
                { label: `All Ministries`, value: '' },
                ...ministriesNames.map((v) => ({ label: v.humanFriendlyName, value: v.name })),
              ]}
              defaultValue={pageSnapshot.ministry}
              onChange={handleMinistryChange}
            />
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
