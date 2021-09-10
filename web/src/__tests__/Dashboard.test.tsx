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
import mockContacts from './fixtures/profile-contacts.json';
import mockNamespaces from './fixtures/profile-namespaces.json';
import mockProfiles from './fixtures/profiles.json';

const browserHistory = createBrowserHistory();

jest.mock(
  '../utils/getDecodedToken',
  () =>
    function getDecodedToken() {
      return {
        email: 'test@example.com',
        family_name: 'Jane',
        given_name: 'Doe',
        name: 'Jane Doe',
        preferred_username: 'janedoe@idir',
        resource_access: { 'registry-web': { roles: ['administrator'] } },
      };
    },
);

jest.mock(
  '../hooks/useRegistryApi',
  () =>
    function useRegistryApi() {
      const getDashboardProjects = jest.fn().mockResolvedValue({
        data: mockProfiles,
      });

      const getContactsByProfileId = jest.fn().mockResolvedValue({
        data: mockContacts,
      });

      const getHumanActionRequests = jest.fn().mockResolvedValue({
        data: [],
      });

      const getNamespacesByProfileId = jest.fn().mockResolvedValue({
        data: mockNamespaces,
      });

      const getQuotaSizeByProfileId = jest.fn().mockResolvedValue({
        data: 'small',
      });

      return {
        getDashboardProjects,
        getContactsByProfileId,
        getHumanActionRequests,
        getNamespacesByProfileId,
        getQuotaSizeByProfileId,
      };
    },
);

function renderDashboard() {
  const utils = render(
    <Router history={browserHistory}>
      <Dashboard />
    </Router>,
  );

  return { ...utils };
}

test('<Dashboard / > Table view should render', async () => {
  const { container } = renderDashboard();

  await waitFor(() => expect(container).toBeInTheDocument());
});
