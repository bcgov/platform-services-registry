import { useFormContext } from 'react-hook-form';
import classNames from '@/components/utils/classnames';
import React, { useState } from 'react';

export default function BudgetInput({ disabled, title, name }: { disabled?: boolean; title: string; name: string }) {
  const [inputValue, setInputValue] = useState('50.00');
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative mb-3">
      <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
        {title}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          disabled={disabled}
          type="number"
          id={name}
          step="0.01"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="50.00"
          defaultValue={50.0}
          aria-describedby="price-currency"
          {...register(name, {
            valueAsNumber: true,
          })}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            USD
          </span>
        </div>
      </div>
      {/* <input
        disabled={disabled}
        defaultValue={50.00}
        type="number"
        step="any"
        className={classNames(
          "block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
          disabled
            ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
            : '',
        )}
        placeholder={'Enter amount here'}
        {...register(name, {
          valueAsNumber: true,
        })}
      /> */}
    </div>
  );
}
