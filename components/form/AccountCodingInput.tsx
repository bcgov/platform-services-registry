import { useState } from 'react';
import InfoTooltip from '@/components/generic/InfoTooltip';

export default function AccountCodingInput({
  title,
  name,
  length,
  placeholder,
  setAccountCoding,
  accountCoding,
  disabled,
  alphanumericRegex,
  infoText,
}: {
  title: string;
  name: string;
  placeholder: string;
  length: number;
  setAccountCoding: any;
  accountCoding: any;
  disabled?: boolean;
  alphanumericRegex: RegExp;
  infoText: string;
}) {
  return (
    <div className="relative mb-3" data-te-input-wrapper-init>
      <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
        {title}
        <InfoTooltip label={infoText} />
      </label>
      <input
        disabled={disabled}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder={placeholder}
        maxLength={length}
        onChange={(e) => {
          const { value } = e.target;
          // Update only if the input is empty (to clear the field) or if it matches the alphanumeric pattern
          if (value === '' || alphanumericRegex.test(value)) {
            setAccountCoding((prev: any) => ({ ...prev, [name]: value }));
          }
        }}
        value={accountCoding[name].toUpperCase()}
      />
    </div>
  );
}
