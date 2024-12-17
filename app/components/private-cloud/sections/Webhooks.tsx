import { Code } from '@mantine/core';
import _get from 'lodash-es/get';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { cn } from '@/utils/js';

export default function Webhooks({ disabled, className }: { disabled: boolean; className?: string }) {
  return (
    <div className={cn(className)}>
      <p>
        We will send a <span className="font-semibold">POST</span> request to the URL below with the following data in{' '}
        <span className="font-semibold">JSON</span> format when the requests are provisioned and completed.
      </p>
      <Code block>{`{
  "action": "<create | update | delete>",
  "product": {
    "id": "<this product's ID>",
    "licencePlate": "<this product's licencePlate>"
  }
}`}</Code>
      <HookFormTextInput
        label="Webhook URL"
        name="webhookUrl"
        placeholder="Enter Webhook URL"
        disabled={disabled}
        error="Please provide a valid HTTPS URL"
        classNames={{ wrapper: 'col-span-full mt-2' }}
      />
    </div>
  );
}
