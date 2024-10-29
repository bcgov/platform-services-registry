'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { z } from 'zod';
import ExternalLink from '@/components/generic/button/ExternalLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { createModal } from '@/core/modal';
import { createPrivateCloudProject } from '@/services/backend/private-cloud/products';
import { openNotificationModal } from './notification';

interface ModalProps {
  productData: FieldValues;
}

interface ModalState {
  success: boolean;
}

export const openPrivateCloudProductCreateSubmitModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'All Set?',
  },
  Component: function ({ productData, state, closeModal }) {
    const methods = useForm({
      resolver: zodResolver(
        z.object({
          confirmed: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
          requestComment: z.string().max(1000).optional(),
        }),
      ),
      defaultValues: {
        confirmed: false,
        requestComment: '',
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
        state.success = true;
      },
      onError: (error: any) => {
        state.success = false;

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

    const openConfirmation = async () => {
      await openNotificationModal(
        {
          callbackUrl: '/private-cloud/requests/all',
          content: (
            <>
              <p>
                We have received your create request for a new product. The Product Owner and Technical Lead(s) will
                receive the approval/rejection decision via email.
              </p>
              <p className="mt-2">
                Alternatively, you can also track the status of your requests from the Registry App Dashboard
              </p>
            </>
          ),
        },
        {
          settings: {
            title: 'Thank you! We have received your create request',
          },
        },
      );
    };

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isCreatingProject} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              if (formData.confirmed) {
                await createProject({ ...productData, requestComment: formData.requestComment });
                closeModal();
                await openConfirmation();
              }

              closeModal();
            })}
          >
            <p className="text-sm text-gray-900">
              After hitting request, our smart robots will start working hard behind the scenes. There is one step, the
              approval process, where a human is involved. They will take the opportunity, if needed, to reach out and
              have an on-boarding conversation with you.
            </p>
            <p className="text-sm text-gray-900 mt-4">
              Also, look out for our notification emails that will provide you with valuable information regarding your
              product status and details.
            </p>

            <p className="text-sm text-gray-900 mt-4 mb-1">
              If you have any additional comments about the request, add them here.
            </p>
            <textarea
              id="requestComment"
              placeholder="Enter an optional comment..."
              {...register('requestComment')}
              rows={3}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
              )}
            />

            <Divider my="md" />

            <FormCheckbox id="consent" inputProps={register('confirmed')}>
              <p className="text-sm text-gray-900">
                By checking this box, I confirm that I have read and understood the roles and responsibilities as
                described in the
                <ExternalLink href="https://digital.gov.bc.ca/cloud/services/private/onboard/" className="ml-1">
                  Onboarding Guide.
                </ExternalLink>
              </p>
            </FormCheckbox>
            <FormError field="confirmed" />

            <Grid className="mt-2">
              <Grid.Col span={4}></Grid.Col>
              <Grid.Col span={8} className="text-right">
                <Button color="gray" onClick={() => closeModal()} className="mr-1">
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </Grid.Col>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    );
  },
  onClose: () => {},
});
