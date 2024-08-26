'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { $Enums, PrivateCloudProject } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconComponents, IconMessage } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import PageAccordion from '@/components/form/PageAccordion';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import Comment from '@/components/modal/Comment';
import ReturnModal from '@/components/modal/ReturnDecision';
import createClientPage from '@/core/client-page';
import { showErrorNotification } from '@/helpers/notifications';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { makePrivateCloudRequestDecision } from '@/services/backend/private-cloud/requests';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestDecision = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestDecision(({ pathParams, queryParams, session, router }) => {
  const [privateState, privateSnap] = usePrivateProductState();
  const { id } = pathParams;
  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [currentAction, setCurrentAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const {
    mutateAsync: makeDecision,
    isPending: isMakingDecision,
    isError: isDecisionError,
    error: decisionError,
  } = useMutation({
    mutationFn: (data: any) => makePrivateCloudRequestDecision(id, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
    onError: (error: any) => {
      showErrorNotification(error);
    },
  });

  useEffect(() => {
    if (!privateSnap.currentRequest) return;

    if (!privateSnap.currentRequest._permissions.viewDecision) {
      router.push(`/private-cloud/requests/${id}/summary`);
      return;
    }

    if (privateSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [privateSnap.currentRequest, router]);

  const methods = useForm({
    resolver: (...args) => {
      const isDeleteRequest = privateSnap.currentRequest?.type === $Enums.RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values: {},
          errors: {},
        };
      }

      return zodResolver(PrivateCloudDecisionRequestBodySchema)(...args);
    },
    values: {
      decisionComment: '',
      decision: '',
      type: privateSnap.currentRequest?.type,
      ...privateSnap.currentRequest?.decisionData,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const setComment = (decisionComment: string) => {
    const data = { ...methods.getValues(), decisionComment };
    makeDecision(data);
  };

  if (!privateSnap.currentRequest) {
    return null;
  }

  const isDisabled = !privateSnap.currentRequest._permissions.edit;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: privateSnap.currentRequest.type !== 'CREATE',
        mode: 'decision',
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: privateSnap.currentRequest.licencePlate as string,
        currentProject: privateSnap.currentRequest.project as PrivateCloudProject,
      },
    },
  ];

  if (privateSnap.currentRequest.requestComment) {
    const comment = privateSnap.currentRequest.requestComment;

    accordionItems.push({
      LeftIcon: IconMessage,
      label: 'User comments',
      description: '',
      Component: () => {
        return (
          <div className="">
            <p className="">{comment}</p>
          </div>
        );
      },
      componentArgs: {} as any,
    });
  }

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(() => {
            if (methods.getValues('decision') === 'APPROVED') setOpenComment(true);
            if (methods.getValues('decision') === 'REJECTED') setOpenComment(true);
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {privateSnap.currentRequest._permissions.review && (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton
                  text="REJECT REQUEST"
                  onClick={() => {
                    methods.setValue('decision', 'REJECTED');
                    setCurrentAction('REJECT');
                  }}
                />
                <SubmitButton
                  text="APPROVE REQUEST"
                  onClick={() => {
                    methods.setValue('decision', 'APPROVED');
                    setCurrentAction('APPROVE');
                  }}
                />
              </div>
            )}
          </div>
        </form>
      </FormProvider>
      <Comment
        open={openComment}
        setOpen={setOpenComment}
        onSubmit={setComment}
        isLoading={isMakingDecision}
        type={privateSnap.currentRequest.type}
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/private-cloud/requests/all" />
    </div>
  );
});
