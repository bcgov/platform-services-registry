'use client';

import classNames from 'classnames';
import React from 'react';

export default function Label({
  children,
  htmlFor,
  className = '',
  required = false,
}: {
  children: React.ReactNode;
  htmlFor: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={classNames('block text-sm font-medium leading-6 text-gray-900 mb-1', className)}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}
