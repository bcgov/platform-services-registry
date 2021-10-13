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

import { errorWithCode } from "@bcgov/common-nodejs-utils";
import { difference } from "lodash";
import { PROJECT_SET_NAMES, ROLE_IDS } from "../constants";

export const validateRequiredFields = (
  requiredFields: string[],
  pojo: object
): Error | undefined => {
  const diff = difference(requiredFields, Object.keys(pojo));

  if (diff.length !== 0) {
    return errorWithCode(`Missing required properties: ${diff}`, 400);
  }

  // extra check_empty function is needed
  // because lodash isEmpty seems to produce confusing results
  // e.g. lodash.isEmpty(true) OR lodash.isEmpty(1) yields true
  function isEmptyValue(value) {
    return (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  }

  const blanks = requiredFields.filter((requiredField: string) => {
    return isEmptyValue(pojo[requiredField]);
  });

  if (blanks.length !== 0) {
    return errorWithCode(
      `Required properties can not be empty: ${blanks}`,
      400
    );
  }

  return;
};

// when we pass the nats/json message through nats / sync endpoints
// there is an inconsistent double quote issue in profile description

// the function BELOW is to address such issue
// in order to make sure the final manifest yaml file is valid to ocp
export const replaceForDescription = (contextJson: any) => {
  const updatedContextJson = contextJson;
  const doubleQuoteReplaced = contextJson.description
    .replace(/"/g, " ")
    .replace(/\\/g, "");

  updatedContextJson.description = doubleQuoteReplaced;
  return updatedContextJson;
};

export const parseEditObject = (results: any) => {
  return results.map((result) => {
    return {
      ...result,
      editObject: JSON.parse(result.editObject),
    };
  });
};

export const transformContacts = (contactSet: any[]) => {
  const contacts: any = {};
  contactSet.forEach((contact: any) => {
    if (contact.roleId === ROLE_IDS.PRODUCT_OWNER) {
      contacts.POEmail = contact.email;
      contacts.POName = `${contact.firstName} ${contact.lastName}`;
      contacts.POGithubId = contact.githubId;
    }
    if (contact.roleId === ROLE_IDS.TECHNICAL_CONTACT) {
      contacts.TCEmail = contact.email;
      contacts.TCName = `${contact.firstName} ${contact.lastName}`;
      contacts.TCGithubId = contact.githubId;
    }
  });
  return contacts;
};

export const generateNamespaceNames = (namespacePrefix: string) => {
  return PROJECT_SET_NAMES.map((n) => `${namespacePrefix}-${n}`);
};
