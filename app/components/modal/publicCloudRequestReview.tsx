'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createModal } from '@/core/modal';
import { showErrorNotification } from '@/helpers/notifications';
import { makePublicCloudRequestDecision } from '@/services/backend/public-cloud/requests';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import { PublicCloudRequestDecisionBody } from '@/validation-schemas/public-cloud';
import { RequestDecision } from '@/validation-schemas/shared';
import { openRequestDecisionCompleteModal } from './requestDecisionComplete';

interface ModalProps {
  request: PublicCloudRequestDetailDecorated;
  finalData: Omit<PublicCloudRequestDecisionBody, 'decisionComment'>;
}

interface ModalState {
  success: boolean;
}

export const openPublicCloudRequestReviewModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
  },
  Component: function ({ request, finalData, state, closeModal }) {
    const methods = useForm({
      resolver: zodResolver(
        z.object({
          decisionComment:
            finalData.decision === RequestDecision.APPROVED
              ? z.string().max(1000).optional()
              : z.string().min(1).max(1000),
        }),
      ),
      defaultValues: {
        decisionComment: '',
      },
    });

    const {
      mutateAsync: makeDecision,
      isPending: isMakingDecision,
      isError: isDecisionError,
      error: decisionError,
    } = useMutation({
      mutationFn: (data: any) => makePublicCloudRequestDecision(request.id, data),
      onSuccess: () => {
        state.success = true;
      },
      onError: (error: any) => {
        showErrorNotification(error);
      },
    });

    const { handleSubmit, register } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isMakingDecision} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              await makeDecision({ ...finalData, ...formData });
              closeModal();

              await openRequestDecisionCompleteModal({ callbackUrl: '/public-cloud/requests/all' });
            })}
          >
            {finalData.decision === RequestDecision.APPROVED ? (
              <>
                <p className="text-sm text-gray-900">
                  Are you sure you want to <span className="font-bold text-blue-600">approve</span> this&nbsp;
                  {request.type.toLocaleLowerCase()} product request?
                </p>
                <p className="text-sm text-gray-900 mt-4 mb-1">
                  If you have any further comments regarding the decision, please add them here.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-900">
                  Are you sure you want to <span className="font-bold text-red-600">reject</span> this&nbsp;
                  {request.type.toLocaleLowerCase()} product request?
                </p>
                <p className="text-sm text-gray-900 mt-4 mb-1">
                  Please provide comments explaining the reason for rejecting the request.
                </p>
              </>
            )}

            <textarea
              id="decisionComment"
              placeholder={
                finalData.decision === RequestDecision.APPROVED ? 'Enter an optional comment...' : 'Enter a comment...'
              }
              {...register('decisionComment')}
              rows={3}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
              )}
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
