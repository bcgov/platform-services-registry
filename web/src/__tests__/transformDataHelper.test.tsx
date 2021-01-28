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

import {
  getProfileContacts,
  getProfileMinistry,
  isProfileProvisioned,
  sortProfileByDatetime,
  transformJsonToCsv,
} from '../utils/transformDataHelper';
import profileContacts from './fixtures/profile-contacts.json';
import profileMinistry from './fixtures/profile-ministry.json';
import profileNamespaces from './fixtures/profile-namespaces.json';
import profiles from './fixtures/profiles.json';
import sortedProfile from './fixtures/sorted-profiles.json';

describe('test the helper function sortProfileByDatetime', () => {
  test('should return sorted profile data based so the order goes from the latest updated profile', () => {
    const stubProfileData = profiles;
    expect(sortProfileByDatetime(stubProfileData)).toMatchObject(sortedProfile);
  });

  test('should return original profile data upon errors', () => {
    const stubProfileData = [
      {
        id: 1,
        name: 'Health Gateway',
        busOrgId: 'CITZ',
        description: null,
        prioritySystem: false,
        criticalSystem: false,
        createdAt: '2020-04-28T00:00:00.000Z',
        updatedAt: 0.33333,
        userId: 4,
      },
    ];
    expect(sortProfileByDatetime(stubProfileData)).toMatchObject(stubProfileData);
  });
});

describe('test the helper function isProfileProvisioned', () => {
  test('should return true if all namespaces under a profile in silver cluster are provisioned', () => {
    const stubProfileNamespaces = profileNamespaces;
    expect(isProfileProvisioned(stubProfileNamespaces)).toEqual(true);
  });
});

describe('test the helper function getProfileContacts', () => {
  test('should return an object with key-values pairs for PO email and TC email', () => {
    const stubProfileContacts = profileContacts;
    expect(getProfileContacts(stubProfileContacts)).toEqual({
      POEmail: 'jane@example.com',
      POFirstName: 'Jane',
      POGithubId: 'jane1100',
      POId: 233,
      POLastName: 'Doe',
      POName: 'Jane Doe',
      TCEmail: 'jim@example.com',
      TCFirstName: 'Jim',
      TCGithubId: 'jim1100',
      TCId: 234,
      TCLastName: 'Doe',
      TCName: 'Jim Doe',
    });
  });
});

describe('test the helper function getProfileMinistry', () => {
  test('should return an object with key-values pairs for PO email and TC email', () => {
    const stubProfileMinistry = profileMinistry;
    const ministry = { busOrgId: 'ALC' };
    expect(getProfileMinistry(stubProfileMinistry, ministry)).toEqual({
      ministryName: 'Agriculture Land Commission',
    });
  });
});

describe('test the helper function transformJsonToCsv', () => {
  test('should return correct csv', () => {
    const stubJson = profiles;
    const result =
      'id,name,description,prioritySystem,criticalSystem,createdAt,updatedAt,userId\r\n"2","EPIC","Hello World","false","true","28-10-2020 03:00","28-10-2020 03:00","4"\r\n"1","Health Gateway","null","false","false","28-04-2020 00:00","28-04-2020 00:00","4"\r\n"3","Mines Digital Services","This is some description","false","false","18-04-2020 10:10","18-04-2020 10:10"\r\n';
    expect(transformJsonToCsv(stubJson)).toEqual(result);
  });
});
