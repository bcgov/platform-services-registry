import React from 'react';
import AsyncAutocomplete from '@/components/form/AsyncAutocomplete';

export default function ExpenseAuthority({ disabled }: { disabled?: boolean }) {
  return (
    <div className="">
      <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-24 gap-y-8">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">Expense Authority (EA)</h3>
            <p className="mt-4 text-base leading-6 text-gray-600">
              Tell us about the Expense Authority (EA). This is typically refers to the permission granted to an
              individual to incur expenses on behalf of the organization within specified limits and guidelines. Please
              use only IDIR linked email address below.
            </p>
          </div>
          <AsyncAutocomplete
            disabled={disabled}
            name="expenseAuthority"
            className="mt-8"
            label="Expense Authority Email"
            placeHolder="Search expense authority's IDIR email address"
          />
        </div>
      </div>
    </div>
  );
}
