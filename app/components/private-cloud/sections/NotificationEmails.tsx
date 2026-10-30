'use client';

import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

interface Props {
  disabled?: boolean;
}

const parseEmails = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter(Boolean);

export default function NotificationEmails({ disabled = false }: Readonly<Props>) {
  const { control } = useFormContext();

  const { field, fieldState } = useController({
    name: 'notificationEmails',
    control,
    defaultValue: [],
  });

  const [text, setText] = useState<string | null>(null);

  const emails: string[] = field.value ?? [];

  // Use form values until the user starts editing.
  const displayValue = text ?? emails.join(', ');

  const handleChange = (value: string) => {
    setText(value);
    field.onChange(parseEmails(value));
  };

  const handleBlur = () => {
    field.onBlur();
    setText(null);
  };

  return (
    <div className="mt-6 flex flex-col text-input">
      <h3 className="text-base lg:text-lg font-semibold leading-7">Additional Notification Emails (optional)</h3>

      <p className="my-4 text-base leading-6 text-gray-600">
        Specify additional email addresses to receive Registry notifications. Separate multiple addresses with commas or
        new lines.
      </p>

      <textarea
        aria-label="Additional Notification Emails (optional)"
        name={field.name}
        ref={field.ref}
        disabled={disabled}
        value={displayValue}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        rows={3}
        className="w-full rounded-md border border-gray-300 p-3"
        placeholder="team@example.com, support@example.com"
        aria-invalid={!!fieldState.error}
      />

      {fieldState.error && <p className="mt-2 text-sm text-red-600">Please enter valid email addresses.</p>}

      <p className="mt-3 text-sm text-gray-600">
        Product teams are responsible for maintaining these email addresses. Registry administrators are not responsible
        for delivery issues involving external, shared, contractor, or team-managed accounts. IDIR-based subscribers
        remain the preferred notification mechanism. Email forwarding from IDIR accounts is recommended where suitable.
        Invalid or unmanaged addresses may result in missed notifications.
      </p>
    </div>
  );
}
