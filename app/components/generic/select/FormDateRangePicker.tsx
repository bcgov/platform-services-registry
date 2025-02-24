'use client';

import { Button } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import _kebabCase from 'lodash-es/kebabCase';
import { useState } from 'react';
import { openDateRangePickerModal } from '@/components/modal/DateRangePicker';
import { cn, isEqualDates, formatDate } from '@/utils/js';
import Label from '../Label';

export interface FormDateRangePickerProps {
  id?: string;
  label?: string;
  placeholder?: string;
  onChange: (value: [Date | null, Date | null]) => void;
  loading?: boolean;
  allowSingleDate?: boolean;
  value?: [Date | null, Date | null];
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
  };
}

export default function FormDateRangePicker({
  id,
  label,
  placeholder = 'Pick dates',
  classNames,
  onChange,
  loading = false,
  allowSingleDate = false,
  value,
  disabled = false,
}: FormDateRangePickerProps) {
  const [dates, setDates] = useState<[Date | null, Date | null]>(value ?? [null, null]);
  if (!id) id = randomId();

  const hasValue = dates && dates.filter(Boolean).length > 0;

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
          color={loading ? 'info' : hasValue ? 'success' : 'secondary'}
          onClick={async () => {
            const { state } = await openDateRangePickerModal(
              { initialValue: dates, allowSingleDate },
              { initialState: { dates } },
            );
            if (!isEqualDates(dates, state.dates)) {
              onChange(state.dates);
              setDates(state.dates);
            }
          }}
        >
          {hasValue ? (
            <div className="ml-2 flex items-center space-x-2">
              <span className="font-semibold">
                {dates[0] ? (
                  formatDate(dates[0], 'MMMM d, yyyy')
                ) : (
                  <span className="font-medium italic">unselected</span>
                )}
              </span>
              <span>-</span>
              <span className="font-semibold">
                {dates[1] ? (
                  formatDate(dates[1], 'MMMM d, yyyy')
                ) : (
                  <span className="font-medium italic">unselected</span>
                )}
              </span>
            </div>
          ) : (
            placeholder
          )}
        </Button>
      </div>
    </div>
  );
}
