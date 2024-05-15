import { $Enums, Prisma } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { useSnapshot, subscribe } from 'valtio';
import FormToggle from '@/components/generic/checkbox/FormToggle';
import FormSelect from '@/components/generic/select/FormSelect';
import { clusters, providers, productSorts, ministryOptions } from '@/constants';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);
  const clusterProviderRef = useRef<HTMLSelectElement>(null);
  const ministryRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const toggleText = 'Show Deleted Products';

  const handleSortChange = (value: string) => {
    const selectedOption = productSorts.find((privateSortName) => privateSortName.humanFriendlyName === value);
    if (selectedOption) {
      pageState.sortKey = selectedOption.sortKey;
      pageState.sortOrder = selectedOption.sortOrder;
    } else {
      pageState.sortKey = '';
      pageState.sortOrder = Prisma.SortOrder.desc;
    }

    pageState.page = 1;
  };

  const handleToggleChange = () => {
    pageState.includeInactive = !pageSnapshot.includeInactive;
    pageState.page = 1;
  };

  const handleClusterChange = (value: string) => {
    pageState.cluster = value;
    pageState.page = 1;
  };

  const handleMinistryChange = (value: string) => {
    pageState.ministry = value;
    pageState.page = 1;
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
              ref={clusterProviderRef}
              id="cluster"
              label="Cluster"
              options={[{ label: 'All Clusters', value: '' }, ...clusters.map((v) => ({ label: v, value: v }))]}
              defaultValue={pageSnapshot.cluster}
              onChange={handleClusterChange}
            />
          </div>
        </fieldset>
        <fieldset className="w-full md:w-48 2xl:w-96">
          <div className="mt-2 md:mt-0 md:ml-4">
            <FormSelect
              ref={ministryRef}
              id="ministry"
              label="Ministry"
              options={[{ label: `All Ministries`, value: '' }, ...ministryOptions]}
              defaultValue={pageSnapshot.ministry}
              onChange={handleMinistryChange}
            />
          </div>
        </fieldset>
        <div></div>
        <FormToggle
          id="includeInactive"
          label={toggleText}
          checked={pageSnapshot.includeInactive}
          onChange={handleToggleChange}
        />
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
