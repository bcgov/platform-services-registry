import { useState } from 'react';

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
  console.log('title, disabled', title, disabled);
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="relative mb-3" data-te-input-wrapper-init>
      <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
        {title}
        <span
          className="ml-2 relative"
          onMouseLeave={() => setShowInfo(false)}
          onMouseOverCapture={() => setShowInfo(true)}
        >
          <span className="absolute bottom-0 left-0 bg-neutral-200 text-gray-400 py-0 px-2 border rounded-full border-solid border-gray-400">
            ℹ️
          </span>
          <span
            className={`absolute min-w-56 p-2 bottom-6 left-6 bg-neutral-200 text-gray-400 bottom-100 border rounded-md border-solid border-gray-400 ${
              showInfo ? 'block' : 'hidden'
            }`}
          >
            {infoText}
          </span>
        </span>
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
