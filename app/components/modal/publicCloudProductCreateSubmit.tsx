'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { z } from 'zod';
import ExternalLink from '@/components/generic/button/ExternalLink';
import MailLink from '@/components/generic/button/MailLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { publicCloudTeamEmail } from '@/constants';
import { createModal } from '@/core/modal';
import { getBilling } from '@/services/backend/billing';
import { createPublicCloudProject } from '@/services/backend/public-cloud/products';
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
    const methods = useForm({
      resolver: zodResolver(
        z.object({
          consent1: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
          consent2: z.boolean().refine((bool) => bool == true, { message: 'Please confirm the agreement.' }),
        }),
      ),
      defaultValues: {
        consent1: false,
        consent2: false,
      },
    });

    const {
      data: billing,
      isLoading: isBillingLoading,
      isError: isBillingError,
      error: billingError,
    } = useQuery({
      queryKey: ['billing', productData.accountCoding],
      queryFn: () => {
        const code = productData.accountCoding;
        if (code.length < 24) return null;
        return getBilling(productData.accountCoding, productData.provider);
      },
    });

    const {
      mutateAsync: createProject,
      isPending: isCreatingProject,
      isError: isCreateError,
      error: createError,
    } = useMutation({
      mutationFn: (data: any) => createPublicCloudProject(data),
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

    let eMouCheckboxContent = null;
    if (billing) {
      if (billing.approved) {
        eMouCheckboxContent = (
          <p className="text-sm text-gray-900">
            Our records show that your team already has a signed MoU with OCIO for {productData.provider} use. This new
            product will be added to the existing MoU. A copy of the signed MoU for this product will be emailed to the
            Ministry Expense Authority.
          </p>
        );
      }
    } else {
      eMouCheckboxContent = (
        <p className="text-sm text-gray-900">
          No eMOU exists for this account coding. We will initiate the process by sending an email to the EA for their
          signature. After the eMOU is signed, it will be reviewed and approved, which typically takes up to 2 business
          days.
        </p>
      );
    }

    return (
      <Box pos="relative">
        <LoadingOverlay
          visible={isBillingLoading || isCreatingProject}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
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
              {eMouCheckboxContent}
            </FormCheckbox>
            <FormError field="consent1" />

            <FormCheckbox id="consent2" inputProps={register('consent2')}>
              <p className="text-sm text-gray-900">
                By checking this box, I confirm that the ministry product team is liable to pay the base charge of USD
                200 to 300 per month for each project set created.
              </p>
            </FormCheckbox>
            <FormError field="consent2" />

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
