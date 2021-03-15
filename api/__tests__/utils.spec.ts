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

import { errorWithCode } from '@bcgov/common-nodejs-utils';
import { replaceForDescription, validateObjProps } from '../src/libs/utils';

jest.mock('@bcgov/common-nodejs-utils', () => ({
  errorWithCode: jest.fn(),
}));

describe('Utils', () => {
  it('validateObjProps works correctly upon missing field(s)', async () => {
    const requiredFields: string[] = [
      'name',
      'description',
      'busOrgId',
      'prioritySystem',
      'userId',
      'namespacePrefix',
      'primaryClusterName',
    ];

    const pojo = {
      name: 'Project X',
      description: 'This is a cool project.',
      busOrgId: 'CITZ',
      prioritySystem: false,
      userId: 4,
    };

    validateObjProps(requiredFields, pojo);
    expect(errorWithCode).toHaveBeenCalledWith(`Missing required properties: namespacePrefix,primaryClusterName`, 400);
  });

  it('validateObjProps works correctly upon empty value in required field(s)', async () => {
    const requiredFields: string[] = [
      'firstName',
      'lastName',
      'email',
      'roleId',
    ];

    const pojo = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: undefined,
      roleId: '',
    };

    validateObjProps(requiredFields, pojo);
    expect(errorWithCode).toHaveBeenCalledWith(`Required properties can not be empty: email,roleId`, 400);
  });

  it('replaceForDescription works correctly', async () => {
    const contextJson = {
      profileId: 118,
      displayName: 'Project X',
      description: 'test some "double quotes"',
    };

    const result = {
      profileId: 118,
      displayName: 'Project X',
      description: 'test some  double quotes ',
    };

    expect(replaceForDescription(contextJson)).toEqual(result);
  });
});
