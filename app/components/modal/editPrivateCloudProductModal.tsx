'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconStatusChange } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { string, z } from 'zod';
import PageAccordion, { PageAccordionItem } from '@/components/generic/accordion/PageAccordion';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import ProductComparison from '@/components/ProductComparison';
import { createModal } from '@/core/modal';
import { comparePrivateProductData, PrivateProductChange } from '@/helpers/product-change';
import { editPrivateCloudProject } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';

interface ModalProps {
  productData: FieldValues;
}

interface ModalState {
  success: boolean;
}

export const openEditPrivateCloudProductModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'All Set?',
  },
  Component: function ({ productData, state, closeModal }) {
    const [, privateSnap] = usePrivateProductState();
    const [change, setChange] = useState<PrivateProductChange>();

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
      mutationFn: (data: any) => editPrivateCloudProject(privateSnap.licencePlate, data),
      onSuccess: () => {
        state.success = true;
      },
      onError: (error: any) => {
        state.success = false;

        notifications.show({
          title: 'Error',
          message: `Failed to edit product ${error.message}`,
          color: 'red',
          autoClose: 5000,
        });
      },
    });

    const { handleSubmit, register } = methods;

    useEffect(() => {
      const _changes = comparePrivateProductData(privateSnap.currentProduct, productData);
      setChange(_changes);
    }, [productData]);

    if (!change || !privateSnap.editQuotaChangeStatus) return <></>;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isEditingProject} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              await editProject({ ...productData, requestComment: formData.requestComment });
              closeModal();
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
              After hitting request, our smart robots will start working hard behind the scenes.
              {(!privateSnap.editQuotaChangeStatus.isEligibleForAutoApproval ||
                change.parentPaths.includes('golddrEnabled')) && (
                <span>
                  &nbsp;There is one step, the approval process, where a human is involved. They will take the
                  opportunity, if needed, to reach out and have an on-boarding conversation with you.
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
