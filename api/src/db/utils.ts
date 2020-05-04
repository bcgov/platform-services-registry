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

/**
 * Convert a string in snake notation to camel case
 *
 * @param {string} str The string to be converted
 * @return The converted string
 */
export const toCamelCase = str =>
  str
    .replace(/_/g, ' ')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+/g, '');

/**
 * Convert a string in camel case to snake notation
 *
 * @param {string} str The string to be converted
 * @return The converted string
 */
export const toSnakeCase = str =>
  str.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`);

/**
 * Convert the keys of an object from snake notation to camel case
 *
 * @param {object} data An object (dictionary) to have its keys converted
 * @return The converted object
 */
export const transformKeysToCamelCase = data => {
  const obj = {};
  Object.keys(data).forEach(key => {
    obj[toCamelCase(key)] = data[key];
  });

  return obj;
};
