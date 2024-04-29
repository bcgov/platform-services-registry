'use client';

import classnames from 'classnames';

export default function LightButton({
  disabled = false,
  type = 'button',
  onClick = () => {},
  className = '',
  children,
}: {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset' | undefined;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classnames(
        'h-9 inline-flex items-center rounded-md bg-white gap-x-2 px-4 py-1.5 text-sm font-semibold text-darkergrey shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        disabled ? 'text-gray-400 border-gray-400' : 'text-black border-black',
        className,
      )}
    >
      {children}
    </button>
  );
}
