'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { string, z } from 'zod';
import ExternalLink from '@/components/generic/button/ExternalLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { createModal, ExtraModalProps } from '@/core/modal';
import { createPrivateCloudProject } from '@/services/backend/private-cloud/products';

interface ModalProps {}

interface ModalState {
  confirmed: boolean;
}

function SignPublicCloudProductModal({ state, closeModal }: { state: ModalState } & ExtraModalProps) {
  const { data: session } = useSession();

  const methods = useForm({
    resolver: zodResolver(
      z.object({
        confirmed: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
        requestComment: z.string().max(1000).optional(),
      }),
    ),
    defaultValues: {
      confirmed: false,
    },
  });

  const {
    mutateAsync: createProject,
    isPending: isCreatingProject,
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationFn: (data: any) => createPrivateCloudProject(data),
    onSuccess: () => {
      state.confirmed = true;
    },
    onError: (error: any) => {
      state.confirmed = false;

      if (error.response?.status === 401) {
        notifications.show({
          title: 'Error',
          message:
            'You are not authorized to create this product. Please ensure you are mentioned in the product contacts to proceed.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: `Failed to create product: ${error.message}`,
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });

  const { handleSubmit, register } = methods;

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isCreatingProject} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      <FormProvider {...methods}>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(async (formData) => {
            if (formData.confirmed) {
              // await createProject({ ...productData, requestComment: formData.requestComment });
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
              The (Team Name)
              <br />
              Hereby referred to as “the Ministry”
            </p>

            <p>For the following services;</p>
            <p className="mb-2">
              &emsp;&emsp;Cloud compute, storage, and container management services, which will be accessible to the
              Ministry’s teams, on the Amazon Web Services platform, through the Government of Canada Cloud Brokering
              Service.
            </p>
            <p className="mb-2">
              &emsp;&emsp;AWS and the Government of Canada will invoice the OCIO, monthly, for the services consumed
              including the Provincial Sales Tax (PST). Additional charges include the 6% brokerage fee that covers the
              Government of Canada’s commission.
            </p>
            <p className="mb-2">
              &emsp;&emsp;The OCIO will pass these costs through to the Ministry by Journal Voucher on a quarterly
              basis.
            </p>
            <p className="mb-2">
              &emsp;&emsp;This agreement also enables the Ministry’s Expense Authority approval for all actual consumed
              usage & any prepayment of reserved AWS services by the Ministry.
            </p>
            <p className="mb-2">
              The Ministry is responsible for understanding the cost structure associated with their current and future
              services consumption in AWS and monitoring their actual consumption to ensure it stays within the planned
              budget.
            </p>
            <p>
              This agreement will be in effect from the date of signing, until a written notification is provided to the
              OCIO, and/or the project is successfully offboarded, as described on the Public Cloud Accelerator
              <ExternalLink href="https://digital.gov.bc.ca/cloud/services/public/" className="ml-1">
                service website
              </ExternalLink>
            </p>
          </div>

          <Divider my="md" />

          <FormCheckbox id="consent" inputProps={register('confirmed')}>
            <p className="">
              By checking this box, I confirm that I have read and understood the roles and responsibilities for use of
              Public Cloud&apos;s services.
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
}

export const openSignPublicCloudProductModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Service Agreement',
  },
  Component: SignPublicCloudProductModal,
  onClose: () => {},
});
