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
import { QuotaCardEdit } from '../components/profileEdit/QuotaCardEdit';
import ProfileEdit from '../views/ProfileEdit';
import mockContacts from './fixtures/profile-contacts.json';
import mockMinistry from './fixtures/profile-ministry.json';
import mockProfile from './fixtures/profiles.json';
import mockQuotaSizes from './fixtures/quota-sizes.json';

const browserHistory = createBrowserHistory();

export enum QuotaSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

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

      const getQuotaSizes = jest.fn().mockResolvedValue({
        data: mockQuotaSizes,
      });

      return { getProfileByProfileId, getMinistry, getContactsByProfileId, getQuotaSizes };
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

function renderQuota() {
  const profileIdProp: string = '1';
  const licensePlateProp: string = '473f50';
  const quotaSizeProp: any = {
    quotaCpuSize: 'cpu-request-0.5-limit-1.5',
    quotaMemorySize: 'memory-request-64-limit-128',
    quotaSnapshotSize: 'snapshot-5',
    quotaStorageSize: 'storage-2',
  };
  const quotaOptionsProp: any = {
    quotaCpuSize: [
      'cpu-request-0.5-limit-1.5',
      'cpu-request-1-limit-2',
      'cpu-request-2-limit-4',
      'cpu-request-4-limit-8',
      'cpu-request-8-limit-16',
      'cpu-request-16-limit-32',
      'cpu-request-32-limit-64',
    ],
    quotaMemorySize: [
      'memory-request-2-limit-4',
      'memory-request-4-limit-8',
      'memory-request-8-limit-16',
      'memory-request-16-limit-32',
      'memory-request-32-limit-64',
      'memory-request-64-limit-128',
    ],
    quotaStorageSize: [
      'storage-1',
      'storage-2',
      'storage-4',
      'storage-16',
      'storage-32',
      'storage-64',
      'storage-128',
      'storage-256',
      'storage-512',
    ],
    quotaSnapshotSize: ['snapshot-5'],
  };
  const handleSubmitRefreshProp = jest.fn();
  const isProvisionedProp: boolean = true;
  const hasPendingEditProp: boolean = false;

  const utils = render(
    <QuotaCardEdit
      profileId={profileIdProp}
      licensePlate={licensePlateProp}
      quotaSize={quotaSizeProp}
      quotaOptions={quotaOptionsProp}
      namespace={`${licensePlateProp}-dev`}
      primaryClusterName="gold"
      handleSubmitRefresh={handleSubmitRefreshProp}
      isProvisioned={isProvisionedProp}
      hasPendingEdit={hasPendingEditProp}
    />,
  );

  return { ...utils };
}

test('<QuotaCardEdit / > Card view should render', async () => {
  const { container } = renderQuota();

  await waitFor(() => expect(container).toMatchSnapshot());
});
