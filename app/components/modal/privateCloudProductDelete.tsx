'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { IconExclamationCircle, IconCircleCheck } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import RequestComments from '@/app/private-cloud/products/(product)/[licencePlate]/comments/RequestComments';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { privateCloudTeamEmail } from '@/constants';
import { createModal } from '@/core/modal';
import {
  deletePrivateCloudProduct,
  checkPrivateCloudProductDeletionAvailability,
} from '@/services/backend/private-cloud/products';
import { PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { cn } from '@/utils/js';
import { commentSchema, CommentSchemaType } from '@/validation-schemas/shared';
import MailLink from '../generic/button/MailLink';
import HookFormTextarea from '../generic/input/HookFormTextarea';
import { openNotificationModal } from './notification';

interface ModalProps {
  product: PrivateCloudProductDetailDecorated;
}

interface ModalState {
  success: boolean;
}

export const openPrivateCloudProductDeleteModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Please confirm your delete request',
  },
  Component: function ({ product, state, closeModal }) {
    const methods = useForm({
      resolver: zodResolver(
        z.object({
          licencePlate: z.literal(product.licencePlate),
          email: z.literal(product.projectOwner.email),
          requestComment: commentSchema.refine((comment) => comment && comment.trim().length > 0, {
            message: 'Invalid input, expected a non-empty reason for deletion',
          }),
        }),
      ),
      defaultValues: {
        licencePlate: '',
        email: '',
      },
    });

    const { data: deletionCheck, isLoading: isCheckingDeletion } = useQuery({
      queryKey: ['apiAccount'],
      queryFn: () => checkPrivateCloudProductDeletionAvailability(product.licencePlate),
      enabled: !!product.licencePlate,
    });

    const { mutateAsync: deleteProduct, isPending: isDeletingProduct } = useMutation({
      mutationFn: (requestComment: CommentSchemaType) =>
        deletePrivateCloudProduct(product.licencePlate, requestComment),
    });

    const { handleSubmit } = methods;

    const canDelete = deletionCheck && Object.values(deletionCheck).every((field) => field);

    return (
      <Box pos="relative">
        <LoadingOverlay
          visible={isCheckingDeletion || isDeletingProduct}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <div className="flex items-center justify-between">
          <span className={cn('flex items-center text-sm', canDelete ? 'text-green-600' : 'text-red-600')}>
            {canDelete ? (
              <>
                <IconCircleCheck className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                Ready to Delete
              </>
            ) : (
              <>
                <IconExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                {deletionCheck && !deletionCheck.artifactory ? (
                  <div className="text-left">
                    Your project set cannot be deleted, because you have an Artifactory project object in your
                    namespaces and probably artifacts in Artifactory. If you need to delete them, please contact
                    platform admins by email <MailLink to={privateCloudTeamEmail} className="text-red-900" /> before
                    trying again.
                  </div>
                ) : (
                  <>
                    Please remember to remove all pods and PVCs from all four namespaces before trying to delete again.
                  </>
                )}
              </>
            )}
          </span>
          <p className="text-sm text-gray-500">Deletion check has {canDelete ? 'passed.' : 'failed.'}</p>
        </div>

        <Divider my="md" />

        <div className="space-y-1">
          <span className="flex">
            <p className="text-sm font-medium text-gray-900">Product name: </p>
            <p className="text-sm text-gray-900 ml-2">{product.name}</p>
          </span>
          <span className="flex">
            <p className="text-sm font-medium text-gray-900">Licence plate: </p>
            <p className="text-sm text-gray-900 ml-2">{product.licencePlate}</p>
          </span>
          <span className="flex">
            <p className="text-sm font-medium text-gray-900">Product Owner: </p>
            <p className="text-sm text-gray-900 ml-2">{product.projectOwner.email.toLocaleLowerCase()}</p>
          </span>
        </div>

        {canDelete ? (
          <>
            <p className="mt-8 text-sm">
              Are you sure you want to delete this product? Enter the following data to proceed:
            </p>

            <FormProvider {...methods}>
              <form
                autoComplete="off"
                onSubmit={handleSubmit(async (formData) => {
                  const res = await deleteProduct(formData.requestComment);
                  if (res) {
                    closeModal();
                    await openNotificationModal(
                      {
                        callbackUrl: '/private-cloud/products/all',
                        content: (
                          <>
                            <p className="text-sm text-gray-900">
                              We have received your delete request for this product. The Product Owner and Technical
                              Lead(s) will receive an update via email.
                            </p>
                            <p className="text-sm text-gray-900 mt-4">
                              Alternatively, you can also track the status of your requests from the Registry App
                              Dashboard
                            </p>
                          </>
                        ),
                      },
                      {
                        settings: {
                          title: 'Thank you! We have received your delete request.',
                        },
                      },
                    );
                  }
                })}
              >
                <HookFormTextInput
                  name="licencePlate"
                  placeholder="Licence plate number"
                  classNames={{ wrapper: 'mt-1' }}
                />
                <HookFormTextInput name="email" placeholder="Product owner email" classNames={{ wrapper: 'mt-1' }} />
                <HookFormTextarea
                  name="requestComment"
                  label="Please specify the reason for deleting this product."
                  placeholder="Enter a reason for deletion..."
                  classNames={{ wrapper: 'mt-2' }}
                />
                <Divider my="md" />

                <Grid className="mt-2">
                  <Grid.Col span={4}>
                    <p className="text-sm text-red-500 font-bold">This operation cannot be undone.</p>
                  </Grid.Col>
                  <Grid.Col span={8} className="text-right">
                    <Button color="gray" onClick={() => closeModal()} className="mr-1">
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </Grid.Col>
                </Grid>
              </form>
            </FormProvider>
          </>
        ) : (
          <Grid className="mt-2">
            <Grid.Col span={4}>
              <p className="text-sm text-gray-500">You are unable to delete this product.</p>
            </Grid.Col>
            <Grid.Col span={8} className="text-right">
              <Button color="gray" onClick={() => closeModal()} className="mr-1">
                Cancel
              </Button>
            </Grid.Col>
          </Grid>
        )}
      </Box>
    );
  },
  onClose: () => {},
});
