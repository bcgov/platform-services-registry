'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { IconStatusChange } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { string, z } from 'zod';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import { success } from '@/components/notification';
import ProductComparison from '@/components/ProductComparison';
import { createModal } from '@/core/modal';
import { comparePrivateProductData, PrivateProductChange } from '@/helpers/product-change';
import { editPrivateCloudProduct } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { commentSchema } from '@/validation-schemas';
import { openNotificationModal } from './notification';

interface ModalProps {
  productData: FieldValues;
  originalProductData: FieldValues;
}

interface ModalState {
  success: boolean;
}

export const openPrivateCloudProductEditSubmitModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'All Set?',
  },
  Component: function ({ productData, originalProductData, state, closeModal }) {
    const [, snap] = usePrivateProductState();
    const [change, setChange] = useState<PrivateProductChange>();

    const methods = useForm({
      resolver: zodResolver(
        z.object({
          requestComment: commentSchema,
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
      mutationFn: (data: any) => editPrivateCloudProduct(snap.licencePlate, data),
      onSuccess: () => {
        state.success = true;
        success();
      },
    });

    const { handleSubmit, register } = methods;

    useEffect(() => {
      const _changes = comparePrivateProductData(snap.currentProduct, originalProductData);
      setChange(_changes);
    }, [originalProductData]);

    if (!change || !snap.editQuotaChangeStatus) return <></>;

    const openConfirmation = async () => {
      await openNotificationModal(
        {
          callbackUrl: '/private-cloud/requests/all',
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

            <p className="text-sm text-gray-900 mt-2">
              After hitting submit, our smart robots will start working hard behind the scenes.
              {(!snap.editQuotaChangeStatus.isEligibleForAutoApproval ||
                change.parentPaths.includes('golddrEnabled')) && (
                <span>
                  &nbsp;There is one step, the approval process, where a human is involved. They will take the
                  opportunity, if needed, to reach out to you if they have any questions.
                </span>
              )}
            </p>
            <p className="text-sm text-gray-900 mt-4">
              Also, look out for our notification emails that will provide you with valuable information regarding your
              product status and details.
            </p>

            <HookFormTextarea
              label="If you have any additional comments about the request, add them here."
              name="requestComment"
              placeholder="Enter an optional comment..."
              classNames={{ wrapper: 'mt-2' }}
            />

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
