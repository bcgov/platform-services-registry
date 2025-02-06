import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, LoadingOverlay } from '@mantine/core';
import _get from 'lodash-es/get';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { success, failure } from '@/components/notification';
import {
  getPrivateCloudProductWebhook,
  upsertPrivateCloudProductWebhook,
} from '@/services/backend/private-cloud/webhooks';
import { cn } from '@/utils/js';
import { privateCloudProductWebhookBodySchema } from '@/validation-schemas';
import Webhooks from './Webhooks';

export default function FormWebhooks({
  disabled,
  licencePlate,
  className,
}: {
  disabled: boolean;
  licencePlate: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(true);
  const methods = useForm({
    resolver: zodResolver(privateCloudProductWebhookBodySchema),
    defaultValues: async () => {
      const result = await getPrivateCloudProductWebhook(licencePlate).catch(() => ({
        url: '',
        secret: '',
        username: '',
        password: '',
      }));
      setLoading(false);
      return result;
    },
  });

  return (
    <div className={cn(className)}>
      <Box pos={'relative'}>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'pink', type: 'bars' }}
        />
        <FormProvider {...methods}>
          <FormErrorNotification />
          <form
            onSubmit={methods.handleSubmit(async (formData) => {
              const result = await upsertPrivateCloudProductWebhook(licencePlate, formData);
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
      </Box>
    </div>
  );
}
