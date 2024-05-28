'use client';

import classnames from 'classnames';
import _isFunction from 'lodash-es/isFunction';
import { InputHTMLAttributes, ChangeEvent, RefObject, ReactNode, useState, useRef } from 'react';
import AlertBox from '@/components/modal/AlertBox';

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

  const [value, setValue] = useState(false);
  const [alertOpened, setAlertOpened] = useState(false);
  const [event, setEvent] = useState<ChangeEvent<HTMLInputElement> | null>(null);

  const handleChecked = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputProps.onChange) inputProps.onChange(e);
    else onChange(e.target.checked);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Keep track of the status by the user
    setValue(e.target.checked);

    if (showConfirm) {
      setAlertOpened(true);
      setEvent(e);
    } else {
      handleChecked(e);
    }
  };
  const confirmTitle = value ? confirmCheckedTitle : confirmUncheckedTitle;
  const confirmMessage = value ? confirmCheckedMessage : confirmUncheckedMessage;

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
          className={classnames(
            'h-4 w-4 mt-1 border-black-400',
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
            className={classnames(
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
      <AlertBox
        isOpen={alertOpened}
        title={confirmTitle}
        message={confirmMessage}
        onCancel={() => {
          // Undo the value
          if (_ref.current) _ref.current.checked = !value;

          setAlertOpened(false);
        }}
        onConfirm={() => {
          // Ensure the value
          if (_ref.current) _ref.current.checked = value;

          // Trigger the change event
          if (event) handleChecked(event);
          setAlertOpened(false);
        }}
        confirmButtonText="Yes"
        cancelButtonText="No"
      />
    </>
  );
}
