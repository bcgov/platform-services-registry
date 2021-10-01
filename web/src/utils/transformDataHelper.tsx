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

import React from 'react';
import { Box, Link } from 'rebass';
import { ContactDetails } from '../components/profileEdit/ContactCard';
import { CSV_PROFILE_ATTRIBUTES } from '../constants';
import { Namespace, ProjectResourceQuotaSize } from '../types';

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

// TODO (sb): Delete when Project Edit pages no longer rely on provisioned flag but use status
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
  return contacts.sort(
    (a: ContactDetails, b: ContactDetails) => Number(a.roleId) - Number(b.roleId),
  );
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

export function composeRequestBodyForQuotaEdit(requestedQuotaSize: ProjectResourceQuotaSize): any {
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

export const convertSnakeCaseToSentence = (text: string) => {
  try {
    if (text) {
      return text
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
        .join(' ');
    }
    return '';
  } catch (err) {
    const msg = 'Unable to convert snake_case to sentence';
    throw new Error(`${msg}, reason = ${err.message}`);
  }
};

// Work with CSV File

const sanitizeStringForCsv = (projectDetail: any) => {
  let sanitizedProjectString;
  if (typeof projectDetail !== 'string') {
    return projectDetail;
  }
  if (projectDetail) {
    sanitizedProjectString = projectDetail.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm, ' ');
    sanitizedProjectString = sanitizedProjectString.replace(/"/g, '""');
    sanitizedProjectString = sanitizedProjectString.replace(/ +(?= )/g, '');
  } else {
    sanitizedProjectString = '';
  }
  return `"${sanitizedProjectString}"`;
};

export function transformJsonToCsv(objArray: any) {
  const csv = [
    CSV_PROFILE_ATTRIBUTES.join(','), // header row first
    ...objArray.map((row: any) =>
      CSV_PROFILE_ATTRIBUTES.map((fieldName) => sanitizeStringForCsv(row[fieldName])).join(','),
    ),
  ].join('\r\n');
  return csv;
}

const traverseAndFlatten = (currentNode: any, target: any, flattenedKey: string | undefined) => {
  for (const key in currentNode) {
    if (Object.prototype.hasOwnProperty.call(currentNode, key)) {
      let newKey;
      if (typeof flattenedKey === 'undefined') {
        newKey = key;
      } else {
        newKey = `${flattenedKey}.${key}`;
      }

      const value = currentNode[key];
      if (typeof value === 'object') {
        traverseAndFlatten(value, target, newKey);
      } else {
        target[newKey] = value;
      }
    }
  }
};

export const flatten = (obj: Object) => {
  const flattenedObject = {};
  const flattenedKey = undefined;
  traverseAndFlatten(obj, flattenedObject, flattenedKey);
  return flattenedObject;
};

export const parseEmails = (contacts: any) => {
  return (
    <>
      {contacts &&
        contacts.map((contact: any) => {
          return (
            <Box key={contact.email}>
              <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
            </Box>
          );
        })}
    </>
  );
};
