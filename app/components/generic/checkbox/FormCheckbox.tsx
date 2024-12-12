'use client';

import _isFunction from 'lodash-es/isFunction';
import { InputHTMLAttributes, ChangeEvent, RefObject, ReactNode, useRef } from 'react';
import { openConfirmModal } from '@/components/modal/confirm';
import { cn } from '@/utils/js';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function FormCheckbox({
  id,
  label,
  ref,
  checked,
  disabled,
  inputProps = {},
  onChange = (v: boolean) => {},
  hasError = false,
  children,
  error,
  className,
  showConfirm = false,
  confirmCheckedTitle = 'Status Change',
  confirmUncheckedTitle = 'Status Change',
  confirmCheckedMessage = 'Are you sure you want to change this ?',
  confirmUncheckedMessage = 'Are you sure you want to change this ?',
}: {
  id: string;
  label?: string;
  ref?: RefObject<HTMLInputElement>;
  checked?: boolean;
  disabled?: boolean;
  inputProps?: InputProps & { ref?: any };
  onChange?: (v: boolean) => void;
  hasError?: boolean;
  children?: ReactNode;
  error?: ReactNode;
  className?: {
    label?: string;
    input?: string;
  };
  showConfirm?: boolean;
  confirmCheckedTitle?: string;
  confirmUncheckedTitle?: string;
  confirmCheckedMessage?: string;
  confirmUncheckedMessage?: string;
}) {
  const _ref = useRef<HTMLInputElement>(null);
  const handleChecked = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputProps.onChange) inputProps.onChange(e);
    else onChange(e.target.checked);
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    if (showConfirm) {
      const confirmTitle = value ? confirmCheckedTitle : confirmUncheckedTitle;
      const confirmMessage = value ? confirmCheckedMessage : confirmUncheckedMessage;

      const res = await openConfirmModal(
        {
          content: confirmMessage,
        },
        {
          settings: {
            title: confirmTitle,
          },
        },
      );

      if (res.state.confirmed) {
        // Ensure the value
        if (_ref.current) _ref.current.checked = value;
        handleChecked(e);
      } else {
        // Undo the value
        if (_ref.current) _ref.current.checked = !value;
      }
    } else {
      handleChecked(e);
    }
  };

  return (
    <>
      <div className="flex">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          {...inputProps}
          onChange={handleChange}
          className={cn(
            'h-4 w-4 mt-[0.25rem] border-black-400',
            disabled ? 'text-gray-600 focus:ring-gray-600 cursor-not-allowed' : 'text-indigo-600 focus:ring-indigo-600',
            className?.input ?? '',
          )}
          // Required to bind three potential refs:
          // 1. From the parent component.
          // 2. From the inputProps ex) react-hook-form.
          // 3. From the this component instance itself.
          ref={(el) => {
            if (!el) return;

            [_ref, ref, inputProps.ref].forEach((rf) => {
              if (!rf) return;

              if (_isFunction(rf)) {
                rf(el);
              } else {
                rf.current = el;
              }
            });
          }}
        />
        <div className="ml-3">
          <label
            htmlFor={id}
            className={cn(
              'text-gray-900 select-none',
              className?.label ?? '',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            {children ?? label}
          </label>
          {hasError && <div>{error}</div>}
        </div>
      </div>
    </>
  );
}
