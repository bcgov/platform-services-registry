import { Alert, Button } from '@mantine/core';
import _compact from 'lodash-es/compact';
import _get from 'lodash-es/get';
import _isEqual from 'lodash-es/isEqual';
import _toUpper from 'lodash-es/toUpper';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FormTextInput from '@/components/generic/input/FormTextInput';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { getAccountCodingString } from '@/helpers/billing';

export default function AccountCoding({
  disabled = false,
  submittable = false,
  isSubmitting = false,
  children,
}: {
  disabled?: boolean;
  submittable?: boolean;
  isSubmitting?: boolean;
  children?: ReactNode;
}) {
  const { formState, setValue, setError, register, watch } = useFormContext();

  const accountCoding = watch('accountCoding');
  const display = getAccountCodingString(accountCoding);
  const hasChanged = formState.isDirty && !_isEqual(_get(formState.defaultValues, 'accountCoding'), accountCoding);

  return (
    <div className="">
      {children}
      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
        <HookFormTextInput
          label="Client Code"
          name="accountCoding.cc"
          placeholder="00000"
          disabled={disabled}
          required
          options={{
            maxLength: 3,
            onChange: (e) => {
              setValue('accountCoding.cc', _toUpper(e.target.value));
            },
          }}
          maxLength={3}
          info="3 Characters, Can contain only numbers and letters. No special characters (e.g. !@#$%^&)"
          classNames={{ wrapper: 'sm:col-span-3' }}
        />
        <HookFormTextInput
          label="Responsibility Centre (RC)"
          name="accountCoding.rc"
          placeholder="00000"
          disabled={disabled}
          required
          options={{
            maxLength: 5,
            onChange: (e) => {
              setValue('accountCoding.rc', _toUpper(e.target.value));
            },
          }}
          maxLength={5}
          info="5 Characters, Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)"
          classNames={{ wrapper: 'sm:col-span-3' }}
        />
        <HookFormTextInput
          label="Service Line (SL)"
          name="accountCoding.sl"
          placeholder="00000"
          disabled={disabled}
          required
          options={{
            maxLength: 5,
            onChange: (e) => {
              setValue('accountCoding.sl', _toUpper(e.target.value));
            },
          }}
          maxLength={5}
          info="5 Characters, Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)"
          classNames={{ wrapper: 'sm:col-span-3' }}
        />
        <HookFormTextInput
          label="Standard Object of Expense (STOB)"
          name="accountCoding.stob"
          placeholder="0000"
          disabled={disabled}
          required
          options={{
            maxLength: 4,
            onChange: (e) => {
              setValue('accountCoding.stob', _toUpper(e.target.value));
            },
          }}
          maxLength={4}
          info="4 Characters, Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)"
          classNames={{ wrapper: 'sm:col-span-3' }}
        />
        <HookFormTextInput
          label="Project Code"
          name="accountCoding.pc"
          placeholder="0000000"
          disabled={disabled}
          required
          options={{
            maxLength: 7,
            onChange: (e) => {
              setValue('accountCoding.pc', _toUpper(e.target.value));
            },
          }}
          maxLength={7}
          info="7 Characters, Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)"
          classNames={{ wrapper: 'sm:col-span-3' }}
        />
        {submittable && (
          <div className="sm:col-span-3 text-left mt-7">
            <Button type="submit" loading={isSubmitting} disabled={!hasChanged}>
              Update
            </Button>
          </div>
        )}
      </div>
      <FormTextInput label="Account Coding" name="display" classNames={{ wrapper: 'mt-2' }} value={display} disabled />
    </div>
  );
}
