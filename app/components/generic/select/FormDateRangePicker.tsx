'use client';

import { Button } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import _kebabCase from 'lodash-es/kebabCase';
import { useState } from 'react';
import { openDateRangePickerModal } from '@/components/modal/DateRangePicker';
import { cn } from '@/utils/js';
import { formatDate } from '@/utils/js';
import Label from '../Label';

export interface FormDateRangePickerProps {
  id?: string;
  label?: string;
  onChange: (value: [Date | null, Date | null]) => void;
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
  classNames,
  onChange,
  value,
  disabled = false,
}: FormDateRangePickerProps) {
  const [dates, setDates] = useState<[Date | null, Date | null]>(value ?? [null, null]);
  if (!id) id = randomId();

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
          onClick={async () => {
            const { state } = await openDateRangePickerModal({ initialValue: dates });
            setDates(state.dates);
            onChange(state.dates);
          }}
        >
          Select
        </Button>

        {dates && dates.filter(Boolean).length > 0 && (
          <div className="ml-2 flex items-center space-x-2 text-gray-700">
            <span className="font-semibold">
              {dates[0] ? (
                formatDate(dates[0], 'yyyy-MM-dd')
              ) : (
                <span className="font-medium text-gray-500 italic">unselected</span>
              )}
            </span>
            <span>-</span>
            <span className="font-semibold">
              {dates[1] ? (
                formatDate(dates[1], 'yyyy-MM-dd')
              ) : (
                <span className="font-medium text-gray-500 italic">unselected</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
