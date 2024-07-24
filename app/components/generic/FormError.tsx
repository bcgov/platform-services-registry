import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export default function FormError({ field }: { field: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = _get(errors, field);
  if (!error) return null;
  return <div className="text-sm text-red-600 mb-2">{String(error.message)}</div>;
}
