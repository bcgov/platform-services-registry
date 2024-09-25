'use client';

import _kebabCase from 'lodash-es/kebabCase';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { HookFormRules } from '../types';
import FormMultiSelect, { FormMultiSelectProps } from './FormMultiSelect';

export default function HookFormMultiSelect<T extends FieldValues>({
  id,
  name,
  label,
  rules,
  data,
  classNames,
  disabled = false,
}: Omit<FormMultiSelectProps, 'name'> & {
  rules?: HookFormRules<T>;
  name: Path<T>;
}) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => {
        return (
          <FormMultiSelect
            id={id}
            name={name}
            label={label}
            data={data}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={disabled}
            classNames={classNames}
          />
        );
      }}
    />
  );
}
