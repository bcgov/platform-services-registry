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

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { difference, isEmpty, isUndefined } from 'lodash';
import { quotaSizeNames, USER_ROLES } from '../constants';
import DataManager from '../db';
import { ClusterNamespace } from '../db/model/namespace';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

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

export const isNotAuthorized = (results: any, user: any): Error | undefined => {

  if (!(user.id === results.userId || user.roles.includes(USER_ROLES.ADMINISTRATOR))) {
    return errorWithCode('Unauthorized Access', 401);
  }

  return;
}

// TODO:(yf) should this method be moved somewhere else?
export const getQuotaOptions = async (clusterNamespace: ClusterNamespace): Promise<any> =>
  new Promise(async (resolve, reject) => {
    const { RequestModel } = dm;
    const { namespaceId, clusterId, quotaCpu, quotaMemory, quotaStorage } = clusterNamespace;
    const quotaOptionsObj = {
      namespaceId,
      clusterId,
      quotaCpu: new Array(),
      quotaMemory: new Array(),
      quotaStorage: new Array(),
    }

    try {
      const existingRequest = await RequestModel.findForClusterNamespace(clusterNamespace.id);
      if (!existingRequest) {
        const spec = { quotaCpu, quotaMemory, quotaStorage };
        // TODO:(yf) think of a way to use constants
        for (const i of Object.keys(spec)) {
          const currentSize = spec[i];
          switch (currentSize) {
            case 'small': {
              quotaOptionsObj[i].push('small', 'medium');
              break;
            }
            case 'medium': {
              quotaOptionsObj[i].push('small', 'medium', 'large');
              break;
            }
            case 'large': {
              quotaOptionsObj[i].push('small', 'large', 'medium');
              break;
            }
          }
        }
      }

      resolve(quotaOptionsObj);
    } catch (err) {
      const message = `Unable to provide quota options for cluster namespce quota request`;
      logger.error(`${message}, err = ${err.message}`);
      resolve(quotaOptionsObj);
    }
  });

export const validateQuotaRequestBody = (quotaOptions: any, body: any): Error | undefined => {
  try {
    const spec = ['quotaCpu', 'quotaMemory', 'quotaStorage'];
    for (let i = 0; i < quotaOptions.length; i++) {
      spec.forEach(specName => {
        const requestedSize: string = body[i][specName];
        if (!quotaSizeNames.includes(requestedSize)) {
          throw new Error();
        }
        const allowedSizes: string[] = quotaOptions[i][specName];
        if (!allowedSizes.includes(requestedSize)) {
          throw new Error();
        }
      });
    }
    return;
  } catch (err) {
    return errorWithCode('Invalid quota request body', 400);
  }
};

// TODO:(yf) add error handling for fn params
export const MergeQuotasIntoNamespaces = (quotaBody: any, namespacesForQuotaEdit: any): Error | object[] => {
  const merged = [];
  try {
    for (let i = 0; i < namespacesForQuotaEdit.length; i++) {
      const { namespaceId } = namespacesForQuotaEdit[i];

      const obj = {
        namespaceId,
        name: namespacesForQuotaEdit[i].name,
        clusters: [{
          clusterId: namespacesForQuotaEdit[i].clusters.clusterId,
          name: namespacesForQuotaEdit[i].clusters.name,
          provisioned: namespacesForQuotaEdit[i].clusters.provisioned,
          quotas: {
            cpu: quotaBody[i].quotaCpu,
            memory: quotaBody[i].quotaMemory,
            storage: quotaBody[i].quotaStorage,
          },
        }],
      };

      // @ts-ignore
      merged.push(obj);
    }
    return merged;
  } catch (err) {
    return errorWithCode('Unable to merge quotas into namespaces', 500);
  }
};
