'use client';

import { faker } from '@faker-js/faker';
import { Tabs, Code, Mark } from '@mantine/core';
import { useAppState } from '@/states/global';
import { ApiAccount } from './types';

const randomObjectId = () => faker.string.uuid().replace(/-/g, '').substring(0, 24);

function PrivateCloudEndpoint() {
  return (
    <div className="">
      <h3 className="text-2xl font-bold my-2">1. Get Private Cloud Products</h3>
      <p className="my-2">This endpoint returns a set of private cloud products.</p>
      <Mark className="font-mono">GET /api/v1/private-cloud/products</Mark>

      <h4 className="text-xl font-bold mt-4 mb-2">Parameters</h4>
      <table className="w-full text-sm text-left rtl:text-right text-black">
        <thead>
          <tr>
            <th className="px-6 py-1">Name</th>
            <th className="px-6 py-1">Type</th>
            <th className="px-6 py-1">In</th>
            <th className="px-6 py-1">Description</th>
            <th className="px-6 py-1">Default</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b">
            <td className="px-6 py-2">page</td>
            <td className="px-6 py-2">number</td>
            <td className="px-6 py-2">query</td>
            <td className="px-6 py-2">The page number of records; starts from 1</td>
            <td className="px-6 py-2">1</td>
          </tr>
          <tr className="bg-white border-b">
            <td className="px-6 py-2">pageSize</td>
            <td className="px-6 py-2">number</td>
            <td className="px-6 py-2">query</td>
            <td className="px-6 py-2">The number of records to fetch</td>
            <td className="px-6 py-2">100; maximum 1000</td>
          </tr>
        </tbody>
      </table>

      <h4 className="text-xl font-bold mt-4 mb-2">200 Response</h4>
      <Code block>{`{
  "success": true,
  "data": [
    {
      "id": "${randomObjectId()}",
      "active": ${faker.helpers.arrayElement([true, false])},
      "licencePlate": "${faker.string.uuid().substring(0, 6)}",
      "name": "${faker.company.name()}",
      "description": "${faker.company.buzzPhrase()}",
      "ministry": "CITZ",
      "ministryName": "Citizens Services",
      "cluster": "SILVER",
      "projectOwner": {
        "id": "${randomObjectId()}",
        "firstName": "${faker.person.firstName()}",
        "lastName": "${faker.person.lastName()}"
      },
      "primaryTechnicalLead": {
        "id": "${randomObjectId()}",
        "firstName": "${faker.person.firstName()}",
        "lastName": "${faker.person.lastName()}"
      },
      "secondaryTechnicalLead": null
    }
  ],
  "totalCount": 1,
  "pagination": {
    "page": 1,
    "pageSize": 100,
    "skip": 0,
    "take": 100
  }
}`}</Code>
    </div>
  );
}

function PublicCloudEndpoint() {
  return (
    <div className="">
      <h3 className="text-2xl font-bold my-2">2. Get Public Cloud Products</h3>
      <p className="my-2">This endpoint returns a set of public cloud products.</p>
      <Mark className="font-mono">GET /api/v1/public-cloud/products</Mark>

      <h4 className="text-xl font-bold mt-4 mb-2">Parameters</h4>
      <table className="w-full text-sm text-left rtl:text-right text-black">
        <thead>
          <tr>
            <th className="px-6 py-1">Name</th>
            <th className="px-6 py-1">Type</th>
            <th className="px-6 py-1">In</th>
            <th className="px-6 py-1">Description</th>
            <th className="px-6 py-1">Default</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b">
            <td className="px-6 py-2">page</td>
            <td className="px-6 py-2">number</td>
            <td className="px-6 py-2">query</td>
            <td className="px-6 py-2">The page number of records; starts from 1</td>
            <td className="px-6 py-2">1</td>
          </tr>
          <tr className="bg-white border-b">
            <td className="px-6 py-2">pageSize</td>
            <td className="px-6 py-2">number</td>
            <td className="px-6 py-2">query</td>
            <td className="px-6 py-2">The number of records to fetch</td>
            <td className="px-6 py-2">100; maximum 1000</td>
          </tr>
        </tbody>
      </table>

      <h4 className="text-xl font-bold mt-4 mb-2">200 Response</h4>
      <Code block>{`{
  "success": true,
  "data": [
    {
      "id": "${randomObjectId()}",
      "active": ${faker.helpers.arrayElement([true, false])},
      "licencePlate": "${faker.string.uuid().substring(0, 6)}",
      "name": "${faker.company.name()}",
      "description": "${faker.company.buzzPhrase()}",
      "ministry": "CITZ",
      "ministryName": "Citizens Services",
      "provider": "AWS",
      "projectOwner": {
        "id": "${randomObjectId()}",
        "firstName": "${faker.person.firstName()}",
        "lastName": "${faker.person.lastName()}"
      },
      "primaryTechnicalLead": {
        "id": "${randomObjectId()}",
        "firstName": "${faker.person.firstName()}",
        "lastName": "${faker.person.lastName()}"
      },
      "secondaryTechnicalLead": null
    }
  ],
  "totalCount": 1,
  "pagination": {
    "page": 1,
    "pageSize": 100,
    "skip": 0,
    "take": 100
  }
}`}</Code>
    </div>
  );
}

export default function ApiTabs({ apiAccount }: { apiAccount: ApiAccount }) {
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
        <Tabs.Tab value="api-endpoints">API Endpoints</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="usage">
        <Code block>{usageCodeBlock}</Code>
      </Tabs.Panel>
      <Tabs.Panel value="api-endpoints">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 md:py-2">
          <div className="col-span-1">
            <PrivateCloudEndpoint />
          </div>
          <div className="col-span-1">
            <PublicCloudEndpoint />
          </div>
        </div>
      </Tabs.Panel>
    </Tabs>
  );
}
