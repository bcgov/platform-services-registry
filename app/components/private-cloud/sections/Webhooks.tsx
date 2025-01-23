import { Code } from '@mantine/core';
import { RequestType } from '@prisma/client';
import _get from 'lodash-es/get';
import ExternalLink from '@/components/generic/button/ExternalLink';
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
  "action": "<${RequestType.CREATE} | ${RequestType.EDIT} | ${RequestType.DELETE}>",
  "product": {
    "id": "<this product's ID>",
    "licencePlate": "<this product's licencePlate>"
  }
}`}</Code>
      <h3 className="font-semibold mt-2">Validation Mechanism</h3>
      <ul className="list-disc pl-8">
        <li>
          <span className="font-semibold">x-hub-signature:</span> An HTTP header commonly used in webhook
          implementations to ensure the authenticity and integrity of incoming requests. It is widely utilized in
          webhooks provided by platforms like GitHub, GitLab, and others. Refer to{' '}
          <ExternalLink href="https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries">
            GitHub&apos;s documentation on validating webhook deliveries
          </ExternalLink>{' '}
          for details on validation logic.
          <br />- Provide the <span className="font-semibold">Secret</span> below to use this mechanism.
        </li>
        <li>
          <span className="font-semibold">Basic Authentication:</span> A simple and widely used method for a client to
          authenticate itself to a server. It involves sending a username and password encoded in Base64 in the
          <code>Authorization</code> header of an HTTP request. Ensure the use of HTTPS to securely transmit
          credentials.
          <br />- Provide the <span className="font-semibold">Username</span> and{' '}
          <span className="font-semibold">Password</span> below to use this mechanism.
        </li>
      </ul>

      <HookFormTextInput
        label="URL"
        name="url"
        placeholder="Enter Webhook URL"
        disabled={disabled}
        error="Please provide a valid HTTPS URL"
        classNames={{ wrapper: 'col-span-full mt-2' }}
      />
      <HookFormTextInput
        label="Secret"
        name="secret"
        placeholder="Enter Webhook Secret"
        disabled={disabled}
        classNames={{ wrapper: 'col-span-full mt-2' }}
      />
      <div className="flex justify-between gap-2 mt-2">
        <HookFormTextInput
          label="Username"
          name="username"
          placeholder="Enter Webhook Username"
          disabled={disabled}
          classNames={{ wrapper: 'w-1/2' }}
        />
        <HookFormTextInput
          label="Password"
          name="password"
          placeholder="Enter Webhook Password"
          disabled={disabled}
          classNames={{ wrapper: 'w-1/2' }}
        />
      </div>
    </div>
  );
}
