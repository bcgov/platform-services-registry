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

'use strict';

import crypto from 'crypto';
import { camelCase } from 'lodash';
import config from '../config';

/**
 * Convert the keys of an object from snake notation to camel case
 *
 * @param {object} data An object (dictionary) to have its keys converted
 * @return The converted object
 */
export const transformKeysToCamelCase = data => {
  const obj = {};
  Object.keys(data).forEach(key => {
    obj[camelCase(key)] = data[key];
  });

  return obj;
};

export const generateNamespacePrefix = (len: number = 6): string => {
  // For DEV/TEST environments, a license plate prefix is necessary to avoid duplication
  // within ArgoCD. Utilizing the prefix "T" for TEST, and "D" for DEV will avoid this.
  return config.get('api:prefix') + crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len);
};