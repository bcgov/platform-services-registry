'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { Provider, TaskStatus, TaskType } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string, z } from 'zod';
import ExternalLink from '@/components/generic/button/ExternalLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { createModal } from '@/core/modal';
import { signPublicCloudMou } from '@/services/backend/public-cloud/products';
import { failure, success } from '../notification';

interface ModalProps {
  licencePlate: string;
  name: string;
  provider: Provider;
}

interface ModalState {
  confirmed: boolean;
}

export const openPublicCloudMouSignModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Service Agreement',
  },
  Component: function ({ licencePlate, name, provider, state, closeModal }) {
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
      mutateAsync: signMou,
      isPending: isSigning,
      isError: isSignError,
      error: signError,
    } = useMutation({
      mutationFn: (data: { taskId: string; confirmed: boolean }) => signPublicCloudMou(licencePlate, data),
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

    const isAWS = provider === Provider.AWS || provider === Provider.AWS_LZA;
    const service = isAWS ? 'AWS' : 'Microsoft Azure';

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isSigning} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              if (formData.confirmed) {
                const task = session?.tasks.find(
                  (tsk) =>
                    tsk.type === TaskType.SIGN_PUBLIC_CLOUD_MOU &&
                    tsk.status === TaskStatus.ASSIGNED &&
                    (tsk.data as { licencePlate: string }).licencePlate === licencePlate,
                );

                if (task) {
                  await signMou({ taskId: task?.id, confirmed: true });
                } else {
                  failure({ message: 'You are not assigned to perform the task.', autoClose: true });
                }
              }

              closeModal();
            })}
          >
            <div className="">
              <p>This agreement is between;</p>
              <p className="text-center font-semibold">
                The Office of the Chief Information Officer
                <br />
                Hereby referred to as “the OCIO”
              </p>
              <p>And</p>
              <p className="text-center font-semibold">
                The {name}
                <br />
                Hereby referred to as “the Ministry”
              </p>

              <p>For the following services;</p>
              <p className="mb-2">
                &emsp;&emsp;Cloud compute, storage, and container management services, which will be accessible to the
                Ministry’s teams, on&nbsp;
                {isAWS ? 'the Amazon Web Services platform' : 'the Microsoft Azure platform'}, through the Government of
                Canada Cloud Brokering Service.
              </p>

              {isAWS ? (
                <p className="mb-2">
                  &emsp;&emsp;AWS and the Government of Canada will invoice the OCIO, monthly, for the services consumed
                  including the Provincial Sales Tax (PST). Additional charges include the 6% brokerage fee that covers
                  the Government of Canada’s commission.
                </p>
              ) : (
                <p className="mb-2">
                  &emsp;&emsp;Microsoft will invoice the OCIO, monthly, for the services consumed including the
                  Provincial Sales Tax (PST). Additional charges include the 6% OCIO administrative fee.
                </p>
              )}

              <p className="mb-2">
                &emsp;&emsp;The OCIO will pass these costs through to the Ministry by Journal Voucher on a quarterly
                basis.
              </p>
              <p className="mb-2">
                &emsp;&emsp;This agreement also enables the Ministry’s Expense Authority approval for all actual
                consumed usage & any prepayment of reserved {service} services by the Ministry.
              </p>
              <p className="mb-2">
                The Ministry is responsible for understanding the cost structure associated with their current and
                future services consumption in {service} and monitoring their actual consumption to ensure it stays
                within the planned budget.
              </p>
              <p>
                This agreement will be in effect from the date of signing, until a written notification is provided to
                the OCIO, and/or the project is successfully offboarded, as described on the Public Cloud Accelerator
                <ExternalLink href="https://digital.gov.bc.ca/cloud/services/public/" className="ml-1">
                  service website
                </ExternalLink>
              </p>
            </div>

            <Divider my="md" />

            <FormCheckbox id="consent" inputProps={register('confirmed')}>
              <p className="">
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
