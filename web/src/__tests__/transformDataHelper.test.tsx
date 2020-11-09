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

import { sortProfileByDatetime } from '../utils/transformDataHelper';
import profiles from './fixtures/profiles.json';
import sortedProfile from './fixtures/sorted-profiles.json';

describe("test the helper function sortProfileByDatetime", () => {
  test("should return sorted profile data based so the order goes from the latest updated profile", () => {
    const stubProfileData = profiles;
    expect(sortProfileByDatetime(stubProfileData)).toMatchObject(sortedProfile);
  });

  test("should return original profile data upon errors", () => {
    const stubProfileData = [
      {
        'id': 1,
        'name': 'Health Gateway',
        'busOrgId': 'CITZ',
        'description': null,
        'prioritySystem': false,
        'criticalSystem': false,
        'createdAt': '2020-04-28T00:00:00.000Z',
        'updatedAt': 0.33333,
        'userId': 4
      }
    ];
    expect(sortProfileByDatetime(stubProfileData)).toMatchObject(stubProfileData);
  });
});
