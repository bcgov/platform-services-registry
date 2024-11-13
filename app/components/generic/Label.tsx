'use client';

import React from 'react';
import CopyableButton from '@/components/generic/button/CopyableButton';
import InfoTooltip from '@/components/generic/InfoTooltip';
import { cn } from '@/utils';

export default function Label({
  children,
  htmlFor = 'label',
  className = '',
  required = false,
  copyable = false,
  onCopy,
  info,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  info?: string;
}) {
  return (
    <div className="flex justify-between">
      <div>
        <label htmlFor={htmlFor} className={cn('block text-sm font-medium leading-6 text-gray-900 mb-1', className)}>
          {children}
          {required && <span className="text-red-500">*</span>}
          {info && <InfoTooltip label={info} />}
        </label>
      </div>
      <div>{copyable && <CopyableButton onClick={onCopy} />}</div>
    </div>
  );
}
