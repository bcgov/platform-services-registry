import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/utils';

export default function FormError({ field, className = '' }: { field: string; className?: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = _get(errors, field);
  if (!error) return null;
  return <div className={cn('text-sm text-red-600 mb-2', className)}>{String(error.message)}</div>;
}
