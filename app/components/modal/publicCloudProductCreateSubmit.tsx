'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { z } from 'zod';
import MailLink from '@/components/generic/button/MailLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { publicCloudTeamEmail } from '@/constants';
import { createModal } from '@/core/modal';
import { Provider } from '@/prisma/client';
import { createPublicCloudProduct } from '@/services/backend/public-cloud/products';
import { success } from '../notification';
import { openNotificationModal } from './notification';

interface ModalProps {
  productData: FieldValues;
}

interface ModalState {
  success: boolean;
}

export const openPublicCloudProductCreateSubmitModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'All Set?',
  },
  Component: function ({ productData, state, closeModal }) {
    const isAws = [Provider.AWS, Provider.AWS_LZA].includes(productData.provider);

    const validationSchema = z.object({
      consent1: z.boolean().refine((val) => val === true, {
        message: 'Please confirm the agreement.',
      }),
      consent2: isAws
        ? z.boolean().refine((val) => val === true, {
            message: 'Please confirm the agreement.',
          })
        : z.boolean().optional(),
    });

    const defaultValues = {
      consent1: false,
      consent2: false,
    };

    const methods = useForm({
      resolver: zodResolver(validationSchema),
      defaultValues,
    });

    const {
      mutateAsync: createProject,
      isPending: isCreatingProject,
      isError: isCreateError,
      error: createError,
    } = useMutation({
      mutationFn: (data: any) => createPublicCloudProduct(data),
      onSuccess: () => {
        state.success = true;
        success();
      },
    });

    const { handleSubmit, register } = methods;

    const openConfirmation = async () => {
      await openNotificationModal(
        {
          callbackUrl: '/public-cloud/requests/all',
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
              await createProject({ ...productData });
              closeModal();
              await openConfirmation();

              closeModal();
            })}
          >
            <p className="text-sm text-gray-900">
              After hitting request, our smart robots will start working hard behind the scenes. There is one step, the
              approval process, where a human is involved. They&apos;ll take the opportunity, if needed, to reach out
              and have an on-boarding conversation with you.
            </p>
            <p className="text-sm text-gray-900 mt-4">
              Also, look out for our notification emails that will provide you with valuable information regarding your
              product status and details.
            </p>

            <Alert variant="" color="primary" title="Note:" className="mt-2" icon={<IconInfoCircle size={80} />}>
              <div className="text-sm text-blue-700">
                Ministry Teams provisioning access to BC Gov&apos;s Landing Zones in AWS and Azure are required to
                attend an onboarding session with the Public Cloud Team. To book an onboarding session, please email us
                at <MailLink to={publicCloudTeamEmail} />.
              </div>
            </Alert>

            <Divider my="md" />

            <FormCheckbox id="consent1" inputProps={register('consent1')}>
              <p className="text-sm text-gray-900">
                We will initiate the process by sending an email to the EA for their signature. After the eMOU is
                signed, it will be reviewed and approved, which typically takes up to 2 business days.
              </p>
            </FormCheckbox>
            <FormError field="consent1" />

            {[Provider.AWS, Provider.AWS_LZA].includes(productData.provider) && (
              <>
                <FormCheckbox id="consent2" inputProps={register('consent2')}>
                  <p className="text-sm text-gray-900">
                    By checking this box, I confirm that the ministry product team is liable to pay the base charge of
                    USD 50 to USD 75 per account, up to around USD $200 to $300 when 4 accounts are created for this
                    project set.
                  </p>
                </FormCheckbox>
                <FormError field="consent2" />
              </>
            )}

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
