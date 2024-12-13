'use client';

import CopyableButton from '@/components/generic/button/CopyableButton';
import { useAppState } from '@/states/global';
import { ApiAccount } from './types';

export default function ApiAccountInfo({ apiAccount }: { apiAccount: ApiAccount }) {
  const [, appSnap] = useAppState();

  const privateProductsEndpoint = `${appSnap.info.BASE_URL}/api/v1/private-cloud/products`;
  const privateProductEndpoint = `${appSnap.info.BASE_URL}/api/v1/private-cloud/products/<id-or-licencePlate>`;
  const publicProductsEndpoint = `${appSnap.info.BASE_URL}/api/v1/public-cloud/products`;
  const publicProductEndpoint = `${appSnap.info.BASE_URL}/api/v1/public-cloud/products/<id-or-licencePlate>`;

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
          <td className="px-6 py-3 font-semibold">API Endpoints</td>
          <td className="px-6 py-3"></td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3 underline">• List Private Cloud Products</td>
          <td className="px-6 py-3">
            <CopyableButton value={privateProductsEndpoint}>{privateProductsEndpoint}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3 underline">• Get Private Cloud Product</td>
          <td className="px-6 py-3">
            <CopyableButton value={privateProductEndpoint}>{privateProductEndpoint}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3 underline">• List Public Cloud Products</td>
          <td className="px-6 py-3">
            <CopyableButton value={privateProductsEndpoint}>{publicProductsEndpoint}</CopyableButton>
          </td>
        </tr>
        <tr className="bg-white border-b">
          <td className="px-6 py-3 underline">• Get Public Cloud Product</td>
          <td className="px-6 py-3">
            <CopyableButton value={publicProductEndpoint}>{publicProductEndpoint}</CopyableButton>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
