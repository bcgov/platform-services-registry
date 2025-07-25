'use client';

import { Button } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import _kebabCase from 'lodash-es/kebabCase';
import { useState } from 'react';
import { openDatePickerModal } from '@/components/modal/DatePicker';
import { cn } from '@/utils/js';
import { formatDate, isEqualDate } from '@/utils/js';
import Label from '../Label';

export interface FormDatePickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  onChange: (value: Date | null) => void;
  loading?: boolean;
  value?: Date | null;
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
  };
}

export default function FormDatePicker({
  id,
  label,
  placeholder = 'Pick a date',
  classNames,
  onChange,
  loading = false,
  value,
  disabled = false,
}: FormDatePickerProps) {
  const [date, setDate] = useState<Date | null>(value ?? null);

  if (!id) id = randomId();

  const buttonColor = loading ? 'info' : date ? 'success' : 'secondary';

  return (
    <div className={cn(classNames?.wrapper)}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      <div className="flex">
        <Button
          disabled={disabled}
          loading={loading}
          color={buttonColor}
          onClick={async () => {
            const { state } = await openDatePickerModal({ initialValue: date }, { initialState: { date } });
            if (!isEqualDate(date, state.date)) {
              onChange(state.date);
              setDate(state.date);
            }
          }}
        >
          {date ? formatDate(date, 'MMMM d, yyyy') : placeholder}
        </Button>
      </div>
    </div>
  );
}
