'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid, LoadingOverlay, Table, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { TaskStatus, TaskType } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { createModal } from '@/core/modal';
import { formatFullName } from '@/helpers/user';
import { getBilling } from '@/services/backend/billing';
import { reviewPublicCloudMou } from '@/services/backend/public-cloud/products';
import { formatDate } from '@/utils/date';

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
      queryFn: () => getBilling(billingId, ''),
      enabled: !!billingId,
    });

    const {
      mutateAsync: reviewMou,
      isPending: isReviewing,
      isError: isReviewError,
      error: reviewError,
    } = useMutation({
      mutationFn: (data: { taskId: string; decision: string }) => reviewPublicCloudMou(licencePlate, data),
      onSuccess: () => {
        state.confirmed = true;

        notifications.show({
          color: 'green',
          title: 'Success',
          message: 'Successfully reviewed!',
          autoClose: 5000,
        });
      },
      onError: (error: any) => {
        state.confirmed = false;
        console.log('error', error);

        notifications.show({
          title: 'Error',
          message: `Failed to review a eMOU: ${error.response.data.error}`,
          color: 'red',
          autoClose: 5000,
        });
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
                const task = session?.tasks.find(
                  (tsk) =>
                    tsk.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU &&
                    tsk.status === TaskStatus.ASSIGNED &&
                    (tsk.data as { licencePlate: string }).licencePlate === licencePlate,
                );

                if (task) {
                  await reviewMou({ taskId: task?.id, decision: 'APPROVE' });
                } else {
                  notifications.show({
                    title: 'Error',
                    message: `You are not assigned to perform the task.`,
                    color: 'red',
                    autoClose: 5000,
                  });
                }
              }

              closeModal();
            })}
          >
            <div className="mb-2">
              <Table highlightOnHover verticalSpacing="sm" className="bg-white">
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Account Coding</Table.Td>
                    <Table.Td>{billing?.accountCoding}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Signed By</Table.Td>
                    <Table.Td>{formatFullName(billing?.signedBy)}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Signed At</Table.Td>
                    <Table.Td>{formatDate(billing?.signedAt)}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </div>

            <FormCheckbox id="consent" inputProps={register('confirmed')}>
              <p className="">
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
