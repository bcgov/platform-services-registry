'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, LoadingOverlay, Table, Box } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { createModal } from '@/core/modal';
import { getAccountCodingString } from '@/helpers/billing';
import { formatFullName } from '@/helpers/user';
import { getPublicCloudProductBilling } from '@/services/backend/public-cloud/products';
import { reviewPublicCloudProductBilling } from '@/services/backend/public-cloud/products';
import { formatDate } from '@/utils/js';
import { failure, success } from '../notification';

interface ModalProps {
  licencePlate: string;
  billingId: string;
}

interface ModalState {
  confirmed: boolean;
}

export const openPublicCloudMouReviewModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Review Electronic Memorandum of Understanding (eMOU)',
  },
  Component: function ({ licencePlate, billingId, state, closeModal }) {
    const { data: session, update: updateSession } = useSession();

    useEffect(() => {
      updateSession();
    }, []);

    const methods = useForm({
      resolver: zodResolver(
        z.object({
          confirmed: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
        }),
      ),
      defaultValues: {
        confirmed: false,
      },
    });

    const {
      data: billing,
      isLoading: billingLoading,
      isError: billingIsError,
      error: billingError,
    } = useQuery({
      queryKey: ['billing', billingId],
      queryFn: () => getPublicCloudProductBilling(licencePlate, billingId),
      enabled: !!billingId,
    });

    const {
      mutateAsync: reviewBilling,
      isPending: isReviewing,
      isError: isReviewError,
      error: reviewError,
    } = useMutation({
      mutationFn: (data: { decision: string }) => reviewPublicCloudProductBilling(licencePlate, { billingId, ...data }),
      onSuccess: () => {
        state.confirmed = true;
        success();
      },
      onError: (error: Error) => {
        state.confirmed = false;
        failure({ error });
      },
    });

    const { handleSubmit, register } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay
          visible={billingLoading || isReviewing}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              if (formData.confirmed) {
                await reviewBilling({ decision: 'APPROVE' });
              }

              closeModal();
            })}
          >
            <div className="mb-2">
              <Table highlightOnHover verticalSpacing="sm" className="bg-white">
                {billing && (
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Account Coding</Table.Td>
                      <Table.Td>{getAccountCodingString(billing.accountCoding)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Signed By</Table.Td>
                      <Table.Td>{formatFullName(billing.signedBy)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Signed At</Table.Td>
                      <Table.Td>{formatDate(billing.signedAt)}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                )}
              </Table>
            </div>

            <FormCheckbox id="consent" inputProps={register('confirmed')}>
              <p className="text-sm text-gray-900">
                By checking this box, I confirm that I have reviewed and approved the Electronic Memorandum of
                Understanding (eMOU).
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
  condition: (v) => !!v.billingId,
});
