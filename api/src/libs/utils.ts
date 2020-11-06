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
// Created by Jason Leach on 2020-05-14.
//


import { errorWithCode } from '@bcgov/common-nodejs-utils';
import { difference, isEmpty, isUndefined } from 'lodash';
import { USER_ROLES } from '../constants';

export const validateObjProps = (fields: string[], pojo: object): Error | undefined => {
  const diff = difference(fields, Object.keys(pojo));
  if (diff.length !== 0) {
    return errorWithCode(`Missing required properties: ${diff}`, 400);
  }

  const blanks = fields.filter(p => {
    switch (typeof p) {
      case 'string':
        return isEmpty(p);
      case 'boolean':
        return isUndefined(p);
      case 'number':
        return isNaN(p);
      default:
        return false;
    }
  });

  if (blanks.length !== 0) {
    return errorWithCode(`Required properties can not be empty: ${blanks}`, 400);
  }

  return;
}

export const isNotAuthorized = (results: any, user: any): Error | undefined  => {

  if (!(user.id === results.userId || user.roles.includes(USER_ROLES.ADMINISTRATOR))) {
    return errorWithCode('Unauthorized Access', 401);
  }

  return;
}
