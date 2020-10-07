//
// Copyright © 2020 Province of British Columbia
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

import { ROLES } from '../constants';

export default function transformFormData(data: any) {
  console.log(data);
  const profile: any = {};
  const productOwner: any = {
    roleId: ROLES.PRODUCTOWNER,
  };
  const technicalContact: any = {
    roleId: ROLES.TECHNICAL,
  };

  for (const [key, value] of Object.entries(data)) {
    const [prefix, fieldName] = key.split('-');

    if (prefix === 'project') {
      profile[fieldName] = value;
    }
    if (prefix === 'po') {
      productOwner[fieldName] = value;
    }
    if (prefix === 'tc') {
      technicalContact[fieldName] = value;
    }
  }

  if (typeof profile.prioritySystem !== 'undefined') {
    const value = profile.prioritySystem.pop();
    profile.prioritySystem = value === 'yes' ? true : false;
  } else {
    profile.prioritySystem = false;
  }

  return {
    profile,
    productOwner,
    technicalContact
  }
}