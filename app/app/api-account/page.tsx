'use client';

import { Alert, Button } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { openConfirmModal } from '@/components/modal/confirm';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getKeycloakApiAccount, createKeycloakApiAccount, deleteKeycloakApiAccount } from '@/services/backend/keycloak';
import ApiAccountInfo from './ApiAccountInfo';
import ApiTabs from './ApiTabs';

const ApiAccountPage = createClientPage({
  roles: [GlobalRole.User],
});
export default ApiAccountPage(({ session }) => {
  const {
    data: apiAccount,
    isLoading: isApiAccountLoading,
    isError: isApiAccountError,
    error: apiAccountError,
    refetch: refetchApiAccount,
  } = useQuery<any, Error>({
    queryKey: ['apiAccount'],
    queryFn: () => getKeycloakApiAccount(),
  });

  const {
    mutateAsync: createApiAccount,
    isPending: isCreatingApiAccount,
    isError: isCreateApiAccountError,
    error: createApiAccountError,
  } = useMutation({
    mutationFn: createKeycloakApiAccount,
  });

  const {
    mutateAsync: deleteApiAccount,
    isPending: isDeletingApiAccount,
    isError: isDeleteApiAccountError,
    error: deleteApiAccountError,
  } = useMutation({
    mutationFn: deleteKeycloakApiAccount,
  });

  if (isApiAccountLoading || isCreatingApiAccount || isDeletingApiAccount) {
    return null;
  }

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 pb-2">API Account</h1>

      {apiAccount ? (
        <>
          <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
            <p className="mb-2">
              A service account has been created for your use.{' '}
              <span className="font-bold">Please keep it confidential and do not share it with others.</span>
            </p>
            <Button
              color="danger"
              onClick={async () => {
                const res = await openConfirmModal({});
                if (res.state.confirmed) {
                  await deleteApiAccount();
                  await refetchApiAccount();
                }
              }}
            >
              Delete the service account
            </Button>
          </Alert>

          <div>
            <ApiAccountInfo apiAccount={apiAccount} />
          </div>

          <div className="mt-3">
            <ApiTabs apiAccount={apiAccount} />
          </div>
        </>
      ) : (
        <div className="">
          <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
            <p className="mb-2">Please create a service account before accessing the API endpoints.</p>
            <Button
              color="primary"
              onClick={async () => {
                await createApiAccount();
                await refetchApiAccount();
              }}
            >
              Request a service account
            </Button>
          </Alert>
        </div>
      )}
    </div>
  );
});
