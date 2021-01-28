//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { render, waitFor } from '@testing-library/react';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import Dashboard from '../views/Dashboard';

const browserHistory = createBrowserHistory();

// TODO: use fixtures and make them work with jest mock values
jest.mock(
  '../hooks/useRegistryApi',
  () =>
    function useRegistryApi() {
      const getProfile = jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'Health Gateway',
            busOrgId: 'CITZ',
            description: null,
            prioritySystem: false,
            criticalSystem: false,
            createdAt: '2020-04-28T00:00:00.000Z',
            updatedAt: '2020-04-28T00:00:00.000Z',
            userId: 4,
          },
          {
            id: 2,
            name: 'EPIC',
            busOrgId: 'CITZ',
            description: 'Hello World',
            prioritySystem: false,
            criticalSystem: true,
            createdAt: '2020-04-28T00:00:00.000Z',
            updatedAt: '2020-04-28T00:00:00.000Z',
            userId: 4,
          },
        ],
      });

      const getContactsByProfileId = jest.fn().mockResolvedValue({
        data: [
          {
            id: 233,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            githubId: 'jane1100',
            roleId: 1,
            archived: false,
            createdAt: '2020-09-10T18:14:13.436Z',
            updatedAt: '2020-09-10T18:14:13.436Z',
          },
          {
            id: 234,
            firstName: 'Jim',
            lastName: 'Doe',
            email: 'jim@example.com',
            githubId: 'jim1100',
            roleId: 2,
            archived: false,
            createdAt: '2020-09-10T18:14:13.436Z',
            updatedAt: '2020-09-10T18:14:13.436Z',
          },
        ],
      });

      const getNamespaceByProfileId = jest.fn().mockResolvedValue({
        data: [
          {
            namespaceId: 149,
            name: '4ea35c-tools',
            clusters: [
              {
                clusterId: 1,
                name: 'kam',
                provisioned: true,
              },
            ],
          },
          {
            namespaceId: 151,
            name: '4ea35c-test',
            clusters: [
              {
                clusterId: 1,
                name: 'kam',
                provisioned: true,
              },
            ],
          },
          {
            namespaceId: 150,
            name: '4ea35c-dev',
            clusters: [
              {
                clusterId: 1,
                name: 'kam',
                provisioned: true,
              },
            ],
          },
          {
            namespaceId: 152,
            name: '4ea35c-prod',
            clusters: [
              {
                clusterId: 1,
                name: 'kam',
                provisioned: true,
              },
            ],
          },
        ],
      });

      return { getProfile, getContactsByProfileId, getNamespaceByProfileId };
    },
);

function renderDashboard() {
  const stubOpenBackdropCB = jest.fn();
  const stubCloseBackdropCB = jest.fn();

  const utils = render(
    <Router history={browserHistory}>
      <Dashboard openBackdropCB={stubOpenBackdropCB} closeBackdropCB={stubCloseBackdropCB} />
    </Router>,
  );

  return { ...utils };
}

test('matches the snapshot', async () => {
  const { container } = renderDashboard();

  await waitFor(() => expect(container).toMatchSnapshot());
});
