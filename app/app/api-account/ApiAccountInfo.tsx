'use client';

import CopyableButton from '@/components/generic/button/CopyableButton';
import { useAppState } from '@/states/global';
import { ApiAccount } from './types';

export default function ApiAccountInfo({ apiAccount }: { apiAccount: ApiAccount }) {
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
