'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconStatusChange } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { string, z } from 'zod';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import { openNotificationModal } from '@/components/modal/notification';
import ProductComparison from '@/components/ProductComparison';
import { createModal } from '@/core/modal';
import { showErrorNotification } from '@/helpers/notifications';
import { comparePublicProductData, PublicProductChange } from '@/helpers/product-change';
import { editPublicCloudProject } from '@/services/backend/public-cloud/products';
import { usePublicProductState } from '@/states/global';

interface ModalProps {
  productData: FieldValues;
  originalProductData: FieldValues;
}

interface ModalState {
  success: boolean;
}

export const openPublicCloudProductEditSubmitModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'All Set?',
  },
  Component: function ({ productData, originalProductData, state, closeModal }) {
    const [, snap] = usePublicProductState();
    const [change, setChange] = useState<PublicProductChange>();

    const methods = useForm({
      resolver: zodResolver(
        z.object({
          requestComment: z.string().max(1000).optional(),
        }),
      ),
      defaultValues: {
        requestComment: '',
      },
    });

    const {
      mutateAsync: editProject,
      isPending: isEditingProject,
      isError: isEditError,
      error: editError,
    } = useMutation({
      mutationFn: (data: any) => editPublicCloudProject(snap.licencePlate, data),
      onSuccess: () => {
        state.success = true;
      },
      onError: (error: any) => {
        showErrorNotification(error);
      },
    });

    const { handleSubmit, register } = methods;

    useEffect(() => {
      const _changes = comparePublicProductData(
        { ...snap.currentProduct, accountCoding: snap.currentProduct?.billing.accountCoding },
        originalProductData,
      );
      setChange(_changes);
    }, [originalProductData]);

    if (!change) return <></>;

    const openConfirmation = async () => {
      await openNotificationModal(
        {
          callbackUrl: '/public-cloud/requests/all',
          content: (
            <>
              <p>
                We have received your edit for this product. The Product Owner and Technical Lead(s) will receive a
                summary via email.
              </p>
              <p className="mt-2">
                Alternatively, you can also track the status of your requests from the Registry App Dashboard
              </p>
            </>
          ),
        },
        {
          settings: {
            title: 'Thank you! We have received your edit request',
          },
        },
      );
    };

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isEditingProject} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              await editProject({ ...productData, requestComment: formData.requestComment });
              closeModal();
              await openConfirmation();
            })}
          >
            <PageAccordion
              items={[
                {
                  LeftIcon: IconStatusChange,
                  label: 'Changes',
                  description: 'Expand to view detailed product changes.',
                  Component: ProductComparison,
                  componentArgs: {
                    data: change.changes,
                  },
                },
              ]}
              initialSelected={[]}
              showToggles={false}
            />

            <HookFormTextarea
              label="Tell us a little bit about why you are requesting a change. Your comment will be saved as part of the request history for future reference.."
              name="requestComment"
              placeholder="Enter an optional comment..."
              classNames={{ wrapper: 'mt-2' }}
            />

            <p className="text-sm text-gray-900 mt-4">
              Also, look out for our notification emails that will provide you with valuable information regarding your
              product status and details.
            </p>

            <Divider my="md" />

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
