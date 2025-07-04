'use client';

import { MultiSelect, ComboboxData, InputBase, Pill, MultiSelectProps } from '@mantine/core';
import _kebabCase from 'lodash-es/kebabCase';
import { FocusEventHandler } from 'react';
import { cn } from '@/utils/js';
import Label from '../Label';

export interface FormMultiSelectProps extends MultiSelectProps {
  id?: string;
  name: string;
  label?: string;
  data: ComboboxData;
  onChange: (value: string[]) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  value: string[];
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
}

export default function FormMultiSelect({
  id,
  name,
  label,
  classNames,
  data,
  onChange,
  onBlur,
  value,
  disabled = false,
  ...others
}: FormMultiSelectProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={cn('multi-select', classNames?.wrapper)}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      {disabled ? (
        <InputBase component="div" multiline>
          <Pill.Group>
            {value.map((item) => (
              <Pill key={item}>{item}</Pill>
            ))}
          </Pill.Group>
        </InputBase>
      ) : (
        <MultiSelect
          placeholder="select..."
          data={data}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          searchable
          clearable
          disabled={disabled}
          {...others}
          classNames={{ input: cn('text-md', classNames?.input) }}
        />
      )}
    </div>
  );
}
