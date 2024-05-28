'use client';

import classnames from 'classnames';
import { RefObject } from 'react';

export default function FormToggle({
  id,
  label,
  ref,
  checked,
  disabled,
  onChange = (v: boolean) => {},
}: {
  id: string;
  label: string;
  ref?: RefObject<HTMLInputElement>;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="cursor-pointer select-none flex flex-row items-center mt-8 md:mt-7 md:ml-4">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        name={id}
        disabled={disabled}
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        defaultValue={'true'}
      />
      <span
        className={classnames(
          'slider mr-3 flex h-[26px] w-[50px] items-center rounded-full p-1 duration-200',
          checked ? 'bg-bcblue' : 'bg-[#CCCCCE]',
        )}
      >
        <span
          className={classnames(
            'dot h-[18px] w-[18px] rounded-full bg-white duration-200',
            checked ? 'translate-x-6' : '',
          )}
        />
      </span>
      <span className="block text-sm font-medium leading-6 text-gray-900">{label}</span>
    </label>
  );
}
