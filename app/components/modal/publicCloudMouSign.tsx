'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import AccountCodingBase from '@/components/shared/AccountCoding';
import { createModal } from '@/core/modal';
import AgreementAppendixV2 from '@/helpers/pdfs/emou/AgreementAppendixV2';
import AgreementTermsV2 from '@/helpers/pdfs/emou/AgreementTermsV2';
import { AccountCoding, Provider } from '@/prisma/client';
import { signPublicCloudProductBilling } from '@/services/backend/public-cloud/products';
import { publicCloudBillingBodySchema } from '@/validation-schemas';
import { failure, success } from '../notification';
interface ModalProps {
  billingId: string;
  licencePlate: string;
  name: string;
  provider: Provider;
  accountCoding: AccountCoding;
  editable?: boolean;
}

interface ModalState {
  confirmed: boolean;
}

export const openPublicCloudMouSignModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Service Agreement',
  },
  Component: function ({
    billingId,
    licencePlate,
    name,
    provider,
    accountCoding,
    editable = false,
    state,
    closeModal,
  }) {
    const { data: session, update: updateSession } = useSession();

    useEffect(() => {
      updateSession();
    }, []);

    const form = useForm({
      resolver: zodResolver(
        publicCloudBillingBodySchema.merge(
          z.object({
            confirmed: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
          }),
        ),
      ),
      defaultValues: {
        confirmed: false,
        accountCoding,
      },
    });

    const { mutateAsync: signBilling, isPending: isSigning } = useMutation({
      mutationFn: (data: { accountCoding: AccountCoding; confirmed: boolean }) =>
        signPublicCloudProductBilling(licencePlate, { billingId, ...data }),
      onSuccess: () => {
        state.confirmed = true;
        success();
      },
      onError: (error: Error) => {
        state.confirmed = false;
        failure({ error });
      },
    });

    const { handleSubmit, register } = form;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isSigning} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...form}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              if (!formData.confirmed) return;

              try {
                await signBilling({
                  accountCoding: editable ? formData.accountCoding : accountCoding,
                  confirmed: true,
                });

                closeModal();
              } catch {
                // Error notification is handled by onError.
              }
            })}
          >
            <AgreementTermsV2 name={name} provider={provider} />
            <AgreementAppendixV2 />
            <AccountCodingBase disabled={!editable} />

            <Divider my="md" />

            <FormCheckbox id="consent" inputProps={register('confirmed')}>
              <p className="text-sm text-gray-900">
                By checking this box, I confirm that I have read and understood the roles and responsibilities for use
                of Public Cloud&apos;s services.
              </p>
            </FormCheckbox>
            <FormError field="confirmed" />

            <div className="flex justify-between mt-2 italic text-gray-500">
              <div>
                {session?.user.name} ({session?.user.email})
              </div>
              <div>{new Date().toLocaleString()}</div>
            </div>

            <Grid className="mt-2">
              <Grid.Col span={4}></Grid.Col>
              <Grid.Col span={8} className="text-right">
                <Button color="gray" onClick={() => closeModal()} className="mr-1">
                  Cancel
                </Button>
                <Button type="submit">Confirm</Button>
              </Grid.Col>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    );
  },
  onClose: () => {},
});
