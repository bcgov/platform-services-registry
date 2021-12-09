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

/**
 * object1 and object2 must have same key ex:
 * {quotaCpuSize: 'small', quotaMemorySize: 'medium', quotaStorageSize: 'medium'}
 * {quotaCpuSize: 'small', quotaMemorySize: 'small', quotaStorageSize: 'small'}
 * This function will return an array of string that have differnt key ['quotaMemorySize', 'quotaStorageSize']
 * @param object1
 * @param object2
 * @returns all key that that value is different in obj1 and obj2
 */
export const findDifference = (object1: any, object2: any): any => {
  const differenceKey: string[] = [];
  Object.keys(object1).forEach((key) => {
    if (object1[key] !== object2[key]) {
      differenceKey.push(key);
    }
  });
  return differenceKey;
};

export const getLicencePlatePostFix = (input: string | undefined): any => {
  const regexMatch = input ? input.match(/(?<=-).*/) : null;
  return regexMatch ? regexMatch[0] : '';
};

export default findDifference;
