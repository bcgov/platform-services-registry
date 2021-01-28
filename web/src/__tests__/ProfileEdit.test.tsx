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
import { Route, Router } from 'react-router-dom';
import ProfileEdit from '../views/ProfileEdit';
import mockContacts from './fixtures/profile-contacts.json';
import mockMinistry from './fixtures/profile-ministry.json';
import mockProfile from './fixtures/profiles.json';

const browserHistory = createBrowserHistory();

jest.mock(
  '../hooks/useRegistryApi',
  () =>
    function useRegistryApi() {
      const getProfileByProfileId = jest.fn().mockResolvedValue({
        data: [mockProfile],
      });

      const getMinistry = jest.fn().mockResolvedValue({
        data: [mockMinistry],
      });

      const getContactsByProfileId = jest.fn().mockResolvedValue({
        data: mockContacts,
      });

      return { getProfileByProfileId, getMinistry, getContactsByProfileId };
    },
);

jest.mock(
  '../utils/transformDataHelper',
  () =>
    function getProfileMinistry() {
      const mockGetProfileMinistry = jest.fn().mockResolvedValue({
        data: [
          {
            name: "Citizen's Services",
          },
        ],
      });
      return { mockGetProfileMinistry };
    },
);

jest.mock(
  '../utils/transformDataHelper',
  () =>
    function getProfileContacts() {
      const mockGetProfileContacts = jest.fn().mockResolvedValue({
        data: mockContacts,
      });
      return { mockGetProfileContacts };
    },
);

function renderProfileEdit() {
  const utils = render(
    <Router history={browserHistory}>
      <Route path="/profile/1/overview">
        <ProfileEdit />
      </Route>
    </Router>,
  );

  return { ...utils };
}

test('matches the snapshot', async () => {
  const { container } = renderProfileEdit();

  await waitFor(() => expect(container).toMatchSnapshot());
});
