'use client';

import React from 'react';
import { cn } from '@/utils';

export default function Label({
  children,
  htmlFor,
  className = '',
  required = false,
  leftSection,
}: {
  children: React.ReactNode;
  leftSection?: React.ReactNode;
  htmlFor: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <div>
        <label htmlFor={htmlFor} className={cn('block text-sm font-medium leading-6 text-gray-900 mb-1', className)}>
          {children}
          {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div>{leftSection}</div>
    </div>
  );
}
