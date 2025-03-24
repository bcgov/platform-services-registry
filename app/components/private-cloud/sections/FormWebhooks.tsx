import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import _get from 'lodash-es/get';
import { FormProvider, useForm } from 'react-hook-form';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { success, failure } from '@/components/notification';
import { upsertPrivateCloudProductWebhook } from '@/services/backend/private-cloud/webhooks';
import { PrivateCloudProductWebhookDetailDecorated } from '@/types/private-cloud';
import { cn } from '@/utils/js';
import { privateCloudProductWebhookBodySchema } from '@/validation-schemas';
import Webhooks from './Webhooks';

export default function FormWebhooks({
  disabled,
  data,
  className,
}: {
  disabled: boolean;
  data: PrivateCloudProductWebhookDetailDecorated;
  className?: string;
}) {
  const methods = useForm({
    resolver: zodResolver(privateCloudProductWebhookBodySchema),
    defaultValues: {
      url: data.url,
      secret: data.secret,
      username: data.username,
      password: data.password,
    },
  });

  return (
    <div className={cn(className)}>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            const result = await upsertPrivateCloudProductWebhook(data.licencePlate, formData);
            if (result) {
              success({ title: 'Webhook', message: 'Updated!' });
            } else {
              failure({ title: 'Webhook', message: 'Failed to update!' });
            }
          })}
          autoComplete="off"
        >
          <Webhooks disabled={disabled} />
          <Button variant="success" type="submit" className="mt-1">
            Update
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
