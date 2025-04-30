'use client';

import { Button } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { openYearPickerModal } from '@/components/modal/YearPicker';
import { cn } from '@/utils/js';
import { formatDate } from '@/utils/js';
import Label from '../Label';

export interface FormYearPickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  onChange: (value: Date | null) => void;
  loading?: boolean;
  value?: Date | null;
  disabled?: boolean;
  defaultCurrentYear?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
  };
}

export default function FormYearPicker({
  id,
  label,
  placeholder = 'Pick a year',
  classNames,
  onChange,
  loading = false,
  value,
  disabled = false,
  defaultCurrentYear = false,
}: FormYearPickerProps) {
  const [year, setYear] = useState<Date | null>(value ?? null);

  useEffect(() => {
    if (defaultCurrentYear && !value && !year) {
      const currentYear = new Date();
      currentYear.setMonth(0, 1);
      setYear(currentYear);
      onChange(currentYear);
    }
  }, [defaultCurrentYear, value, onChange, year]);

  if (!id) id = randomId();

  return (
    <div className={cn(classNames?.wrapper)}>
      {label && (
        <Label htmlFor={id} className={`font-bold ${classNames?.label}`}>
          {label}
        </Label>
      )}

      <div className="flex">
        <Button
          className="pl-10 pr-10 mb-5"
          disabled={disabled}
          loading={loading}
          color={loading ? 'info' : year ? 'success' : 'secondary'}
          onClick={async () => {
            const { state } = await openYearPickerModal({ initialValue: year }, { initialState: { date: year } });
            onChange(state.date);
            setYear(state.date);
          }}
        >
          {year ? formatDate(year, 'yyyy') : placeholder}
        </Button>
      </div>
    </div>
  );
}
