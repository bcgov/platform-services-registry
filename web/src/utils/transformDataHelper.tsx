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

import { ContactDetails } from '../components/profileEdit/ContactCard';
import { COMPONENT_METADATA, ROLES } from '../constants';
import { Namespace, QuotaSize } from '../types';

export function transformForm(data: any) {
  const profile: any = {};
  const productOwner: any = {
    roleId: ROLES.PRODUCT_OWNER,
  };
  const technicalContact: any = {
    roleId: ROLES.TECHNICAL_LEAD,
  };
  const clusters: any = [];

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
    if (fieldName === 'primaryClusterName') {
      clusters.push(value);
    }
    if (fieldName === 'primaryClusterName' && value === 'gold') {
      clusters.push('golddr');
    }
    if (fieldName === 'clabDR' && value === true) {
      clusters.push('clab');
    }
  }

  if (typeof profile.prioritySystem !== 'undefined') {
    profile.prioritySystem = !!profile.prioritySystem;
  } else {
    profile.prioritySystem = false;
  }

  COMPONENT_METADATA.forEach((item) => {
    const checkboxValue: string = item.inputValue;

    if (typeof profile[checkboxValue] !== 'undefined') {
      profile[checkboxValue] = !!profile[checkboxValue];
    } else {
      profile[checkboxValue] = false;
    }
  });

  return {
    profile,
    productOwner,
    technicalContact,
    clusters,
  };
}

export function transformClusters(data: any) {
  const clusters: any = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'primaryClusterName') {
      clusters.push(value);
    }
    if (key === 'primaryClusterName' && value === 'gold') {
      clusters.push('golddr');
    }
    if (key === 'clabDR' && value === true) {
      clusters.push('clab');
    }
  }
  return clusters;
}

// sort the list of profiles from the latest to the earliest update_at
export function sortProfileByDatetime(profileData: any): any[] | [] {
  try {
    return profileData.sort((a: any, b: any) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch (err) {
    return profileData;
  }
}

// returns true if ALL namespaces under a profile in default cluster are provisioned true
export function isProfileProvisioned(profile: any, namespaces: any[]): boolean {
  try {
    const { primaryClusterName } = profile;

    namespaces.forEach((namespace: any) => {
      const clusterNamespace = namespace.clusters.filter(
        (cluster: any) => cluster.name === primaryClusterName,
      )[0];
      if (!clusterNamespace.provisioned) {
        throw Error(`${namespace.name} is not provisioned on ${primaryClusterName}`);
      }
    });

    return true;
  } catch (err) {
    return false;
  }
}

export function sortContacts(contacts: ContactDetails[]): ContactDetails[] {
  return contacts.sort((a: ContactDetails, b: ContactDetails) => Number(a.roleId) - Number(b.roleId));
}

// TODO (sb): Remove this transform when updating dashboard JSON fetch
// returns an object with key-values pairs for PO email and TC email
export function getProfileContacts(contactSet: any[]): object {
  const contacts: any = {};
  contactSet.forEach((contact: any) => {
    if (contact.roleId === ROLES.PRODUCT_OWNER) {
      contacts.POEmail = contact.email;
      contacts.POName = `${contact.firstName} ${contact.lastName}`;
      contacts.POGithubId = contact.githubId;
      contacts.POFirstName = contact.firstName;
      contacts.POLastName = contact.lastName;
      contacts.POId = contact.id;
    }
    if (contact.roleId === ROLES.TECHNICAL_LEAD) {
      contacts.TCEmail = contact.email;
      contacts.TCName = `${contact.firstName} ${contact.lastName}`;
      contacts.TCGithubId = contact.githubId;
      contacts.TCFirstName = contact.firstName;
      contacts.TCLastName = contact.lastName;
      contacts.TCId = contact.id;
    }
  });
  return contacts;
}

// convert datetime string from YYYY-MM-DDTHH:MM:SSZ to DD-MM-YYYY HH:MM
function convertDatetime(ISODatetimeString: string): string {
  const splitted = ISODatetimeString.split('T');
  const HHMM = splitted[1].replace(/\..+/, '').split(':');
  HHMM.pop();
  return `${splitted[0].split('-').reverse().join('-')} ${HHMM.join(':')}`;
}

export function transformJsonToCsv(objArray: any) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;

  array.forEach((item: any) => {
    item.createdAt = convertDatetime(item.createdAt);
    item.updatedAt = convertDatetime(item.updatedAt);
  });

  let str = '';
  let line = '';

  // eslint-disable-next-line
  for (const index in array[0]) {
    line += `${index},`;
  }

  line = line.slice(0, -1);
  str += `${line}\r\n`;

  function sanitizeStringForCsv(desc: any) {
    let itemDesc;
    if (typeof desc !== 'string') {
      return desc;
    }
    if (desc) {
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
    // eslint-disable-next-line
    for (const index in array[i]) {
      // eslint-disable-next-line
      line += '"' + sanitizeStringForCsv(array[i][index]) + '"' + ',';
    }

    line = line.slice(0, -1);
    str += `${line}\r\n`;
  }
  return str;
}

export function getProfileMinistry(ministrySet: any[], projectDetails: any): object {
  const ministryDetails: any = {};
  ministrySet.forEach((ministry: any) => {
    if (ministry.id === projectDetails.busOrgId) {
      ministryDetails.ministryName = ministry.name;
    }
  });
  return ministryDetails;
}

export function getLicensePlate(namespaces: Namespace[]): string | Error {
  try {
    return namespaces[0].name.split('-')[0];
  } catch (err) {
    const msg = 'Unable to get license plate given namespaces json';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
}

export function composeRequestBodyForQuotaEdit(requestedQuotaSize: QuotaSize): any {
  try {
    return {
      requestedQuotaSize,
    };
  } catch (err) {
    const msg = 'Unable to compose request body';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
}

export function getClusterDisplayName(clusterName: string, clusters: any[]): string | Error {
  try {
    const { displayName } = clusters.filter((cluster: any) => cluster.name === clusterName)[0];

    const isEmptyValue = (value: any) =>
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'object' && Object.keys(value).length === 0);
    if (isEmptyValue(displayName) || typeof displayName !== 'string') {
      throw new Error('Empty value');
    }

    return displayName;
  } catch (err) {
    const msg = 'Unable to get cluster display name';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
}
