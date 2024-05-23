'use client';

import { Alert, Group, Avatar, Tabs, Code } from '@mantine/core';
import { IconInfoCircle, IconCircleLetterR, IconCircleLetterD, IconProps, Icon } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { openConfirmModal } from '@/components/generic/modal/ConfirmModal';
import createClientPage from '@/core/client-page';
import { getKeycloakApiAccount, createKeycloakApiAccount, deleteKeycloakApiAccount } from '@/services/backend/keycloak';
import { useAppState } from '@/states/global';

interface ApiAccount {
  clientId: string;
  secret: string;
}

function ApiAccountInfo({ apiAccount }: { apiAccount: ApiAccount }) {
  const [appState, appSnap] = useAppState();

  const privateProductsEndpoint = `${appSnap.info.BASE_URL}/api/v1/private-cloud/products`;
  const publicProductsEndpoint = `${appSnap.info.BASE_URL}/api/v1/public-cloud/products`;

  return (
    <table className="w-full text-sm text-left rtl:text-right text-black">
      <tbody>
        <tr className="bg-white border-b">
          <td className="px-6 py-3">Client ID</td>
          <td className="px-6 py-3">
            <CopyableButton value={apiAccount.clientId}>{apiAccount.clientId}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3">Client Secret</td>
          <td className="px-6 py-3">
            <CopyableButton value={apiAccount.secret}>*************************</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3">Token Endpoint</td>
          <td className="px-6 py-3">
            <CopyableButton value={appSnap.info.TOKEN_URL}>{appSnap.info.TOKEN_URL}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3">API Endpoint - Get Private Cloud Products</td>
          <td className="px-6 py-3">
            <CopyableButton value={privateProductsEndpoint}>{privateProductsEndpoint}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3">API Endpoint - Get Public Cloud Products</td>
          <td className="px-6 py-3">
            <CopyableButton value={privateProductsEndpoint}>{publicProductsEndpoint}</CopyableButton>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function ApiTabs({ apiAccount }: { apiAccount: ApiAccount }) {
  const [appState, appSnap] = useAppState();

  const privateProductsEndpoint = `${appSnap.info.BASE_URL}/api/v1/private-cloud/products`;

  const usageCodeBlock = `
  const tokenResponse = await fetch('${appSnap.info.TOKEN_URL}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: '${apiAccount.clientId}',
      client_secret: <YOUR_CLIENT_SECRET>,
    }),
  });

  const { access_token } = await tokenResponse.json();

  const dataResponse = await fetch('${privateProductsEndpoint}', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json',
    },
  });

  const data = await dataResponse.json();
  `;

  return (
    <Tabs variant="outline" defaultValue="usage">
      <Tabs.List>
        <Tabs.Tab value="usage">Usage</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="usage">
        <Code block>{usageCodeBlock}</Code>
      </Tabs.Panel>
    </Tabs>
  );
}

const ApiAccountPage = createClientPage({
  roles: ['user'],
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
            <p className="mb-2">A service account has been created for your use.</p>
            <button
              type="button"
              className="h-9 inline-flex items-center rounded-md bg-red-700 gap-x-2 px-4 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-red-300"
              onClick={async () => {
                const response = await openConfirmModal({});
                if (response.confirmed) {
                  await deleteApiAccount();
                  await refetchApiAccount();
                }
              }}
            >
              Delete the service account
            </button>
          </Alert>

          <div>
            <ApiAccountInfo apiAccount={apiAccount} />
          </div>

          <div className="mt-2">
            <ApiTabs apiAccount={apiAccount} />
          </div>
        </>
      ) : (
        <div className="">
          <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
            <p className="mb-2">Please create a service account before accessing the API endpoints.</p>
            <button
              type="button"
              className="h-9 inline-flex items-center rounded-md bg-blue-700 gap-x-2 px-4 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-blue-300"
              onClick={async () => {
                await createApiAccount();
                await refetchApiAccount();
              }}
            >
              Request a service account
            </button>
          </Alert>
        </div>
      )}
    </div>
  );
});
