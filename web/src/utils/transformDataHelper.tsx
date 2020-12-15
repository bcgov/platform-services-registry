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

import { COMPONENT_METADATA, ROLES } from '../constants';
import { CNQuotaOptions, CNQuotas, Namespace, QuotaSizeSet } from '../types';

export function transformForm(data: any) {
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
    profile.prioritySystem = profile.prioritySystem ? true : false;
  } else {
    profile.prioritySystem = false;
  }

  COMPONENT_METADATA.forEach(item => {
    const checkboxValue: string = item.inputValue;

    if (typeof profile[checkboxValue] !== 'undefined') {
      profile[checkboxValue] = profile[checkboxValue] ? true : false;
    } else {
      profile[checkboxValue] = false;
    }
  });

  return {
    profile,
    productOwner,
    technicalContact
  }
};

// sort the list of profiles from the latest to the earliest update_at
export function sortProfileByDatetime(profileData: any): any[] | [] {
  try {
    return profileData.sort((a: any, b: any) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch (err) {
    return profileData;
  }
};

// returns true if ALL namespaces under a profile in silver clusters are provisioned true
export function isProfileProvisioned(namespaceSet: any[]): boolean {
  try {
    namespaceSet.forEach((namespace: any) => {
      // TODO: refactor here when we add other clusters
      if (!namespace.clusters[0].provisioned) {
        throw Error;
      }
    });
    return true;
  } catch (err) {
    return false;
  }
};

// returns an object with key-values pairs for PO email and TC email
export function getProfileContacts(contactSet: any[]): object {
  let contacts: any = {};
  contactSet.forEach((contact: any) => {
    if (contact.roleId === ROLES.PRODUCTOWNER) {
      contacts.POEmail = contact.email;
      contacts.POName = contact.firstName + ' ' + contact.lastName;
      contacts.POGithubId = contact.githubId;
      contacts.POFirstName = contact.firstName;
      contacts.POLastName = contact.lastName;
      contacts.POId = contact.id;
    }
    if (contact.roleId === ROLES.TECHNICAL) {
      contacts.TCEmail = contact.email;
      contacts.TCName = contact.firstName + ' ' + contact.lastName;
      contacts.TCGithubId = contact.githubId;
      contacts.TCFirstName = contact.firstName;
      contacts.TCLastName = contact.lastName;
      contacts.TCId = contact.id;
    }
  });
  return contacts;
};


// convert datetime string from YYYY-MM-DDTHH:MM:SSZ to DD-MM-YYYY HH:MM
function convertDatetime(ISODatetimeString: string): string {
  const splitted = ISODatetimeString.split('T');
  const HHMM = splitted[1].replace(/\..+/, '').split(':');
  HHMM.pop();
  return splitted[0].split('-').reverse().join('-') + ' ' + HHMM.join(':');
}

export function transformJsonToCsv(objArray: any) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;

  array.forEach((item: any) => {
    item.createdAt = convertDatetime(item.createdAt);
    item.updatedAt = convertDatetime(item.updatedAt);
  });

  let str = '';
  let line = '';

  for (let index in array[0]) {
    line += index + ',';
  }

  line = line.slice(0, -1);
  str += line + '\r\n';

  function sanitizeStringForCsv(desc: any) {
    let itemDesc;
    if (typeof desc !== 'string') {
      return desc;
    } else if (desc) {
      itemDesc = desc.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm, ' ');
      itemDesc = itemDesc.replace(/"/g, '""');
      itemDesc = itemDesc.replace(/ +(?= )/g, '');
    } else {
      itemDesc = '';
    }
    return itemDesc;
  }

  for (let i = 0; i < array.length; i++) {
    line = '';

    for (let index in array[i]) {
      // eslint-disable-next-line
      line += '"' + sanitizeStringForCsv(array[i][index]) + '"' + ',';
    }

    line = line.slice(0, -1);
    str += line + '\r\n';
  }
  return str;
};

export function getProfileMinistry(ministrySet: any[], profileDetails: any): object {
  let ministryDetails: any = {};
  ministrySet.forEach((ministry: any) => {
    if (ministry.id === profileDetails.busOrgId) {
      ministryDetails.ministryName = ministry.name;
    }
  });
  return ministryDetails;
}

// the following logics need to be changed when we no longer bundle all quota requests in one
export function getCurrentQuotaSize(namespaces: Namespace[]): QuotaSizeSet | Error {
  try {
    return namespaces[0].clusters[0].quotas.cpu;
  } catch (err) {
    const msg = 'Unable to get current quota size given namespaces json';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
};

export function getLicensePlate(namespaces: Namespace[]): string | Error {
  try {
    return namespaces[0].name.split('-')[0];
  } catch (err) {
    const msg = 'Unable to get license plate given namespaces json';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
};

export function getCurrentQuotaOptions(cnQuotaOptionsList: CNQuotaOptions[], currentQuotaSize: QuotaSizeSet): QuotaSizeSet[] | [] | Error {
  try {
    const array: QuotaSizeSet[] = cnQuotaOptionsList[0].quotaCpu;
    const index = array.indexOf(currentQuotaSize);
    if (index === -1) {
      return [];
    } else {
      array.splice(index, 1);
      return array;
    }
  } catch (err) {
    const msg = 'Unable to get current quota options given namespaces json';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
};

export function composeRequestBodyForQuotaEdit(requestNextSize: QuotaSizeSet, cnQuotaOptionsList: CNQuotaOptions[]): CNQuotas[] | [] | Error {
  try {
    return cnQuotaOptionsList.map((cnQuotaOptions: CNQuotaOptions) => {
      const { namespaceId, clusterId } = cnQuotaOptions;
      return {
        namespaceId,
        clusterId,
        quotaCpu: requestNextSize,
        quotaMemory: requestNextSize,
        quotaStorage: requestNextSize,
      };
    });
  } catch (err) {
    const msg = 'Unable to compose request body for given namespaces json';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
};