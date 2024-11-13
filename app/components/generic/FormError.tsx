import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/utils';

export default function FormError({
  field,
  className = '',
  message = '',
}: {
  field: string;
  className?: string;
  message?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = _get(errors, field);
  if (!error) return null;
  return <div className={cn('text-sm text-red-600 mb-2', className)}>{message ?? String(error.message)}</div>;
}
