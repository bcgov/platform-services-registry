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

import { logger } from '@bcgov/common-nodejs-utils';
import DataManager from '../db';
import { ClusterNamespace, ProjectNamespace, QuotaSize } from '../db/model/namespace';
import { Request } from '../db/model/request';
import { AuthenticatedUser } from './authmware';
import { getDefaultCluster } from './namespace-set';
import shared from './shared';
import { validateObjProps } from './utils';

const dm = new DataManager(shared.pgPool);
const { NamespaceModel, ClusterModel, RequestModel } = dm;
const whichService = 'quota editing';
const quotaSizeNames = [QuotaSize.Small, QuotaSize.Medium, QuotaSize.Large];
const spec = ['quotaCpu', 'quotaMemory', 'quotaStorage'];

export interface QuotaObject {
  cpu: QuotaSize;
  memory: QuotaSize;
  storage: QuotaSize;
};

export interface NamespaceCNObject {
  clusterId: number;
  namespaceId: number;
  name: string;
  provisioned: boolean;
  quotas: QuotaObject;
};

export const mergeRequestedCNToNamespaceSet = async (requestedClusterNamespaces: ClusterNamespace[], namespaceSet: ProjectNamespace[], clusterName: string): Promise<ProjectNamespace[] | undefined> => {
  try {
    let cluster;
    if (!clusterName) {
      cluster = await getDefaultCluster();
    } else {
      cluster = await ClusterModel.findByName(clusterName);
      if (!cluster) {
        const errmsg = `Cant find given cluster name ${clusterName}`;
        throw new Error(errmsg);
      }
    }

    const merged: ProjectNamespace[] = [];
    requestedClusterNamespaces.forEach((requestedClusterNamespace: ClusterNamespace) => {
      const targetNamespace = namespaceSet.filter(
        // @ts-ignore
        (namespace: ProjectNamespace) => namespace.namespaceId === requestedClusterNamespace.namespaceId
      ).pop();

      if (!targetNamespace || !targetNamespace.clusters) {
        throw new Error(`Cant find target namespace or its clusters for namespaceId
        ${requestedClusterNamespace.namespaceId}`);
      }

      const num: number = targetNamespace.clusters.findIndex(
        (cn: ClusterNamespace) => cn.clusterId === requestedClusterNamespace.clusterId
      )

      // convert from ClusterNamespace to JSON-NamespaceCNObject
      const { clusterId, namespaceId, provisioned, quotaCpu, quotaMemory, quotaStorage } = requestedClusterNamespace;
      targetNamespace.clusters[num] = {
        clusterId, namespaceId, provisioned,
        // @ts-ignore
        name: cluster.name,
        quotas: {
          cpu: quotaCpu,
          memory: quotaMemory,
          storage: quotaStorage,
        },
      };
      merged.push(targetNamespace);
    });
    return merged;
  } catch (err) {
    const message = `Unable to merge reuqested clusterNamespace to namespacesSet for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    return;
  };
};

export const getNamespaceSet = async (profileId: string, user: AuthenticatedUser): Promise<ProjectNamespace[]> => {
  // TODO:(yf) add further data sanity check
  const rv = validateObjProps(['profileId'], { profileId });
  if (rv) {
    throw rv;
  }

  try {
    // const record = await ProfileModel.findById(Number(profileId));
    // const notAuthorized = isNotAuthorized(record, user);
    // if (notAuthorized) {
    //   throw notAuthorized;
    // }

    return await NamespaceModel.findForProfile(Number(profileId));
  } catch (err) {
    const message = `Unable to get namespaceSet under profile ${profileId} for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    return [];
  }
};

export interface QuotaOptionsObject {
  namespaceId: number,
  clusterId: number,
  quotaCpu: QuotaSize[],
  quotaMemory: QuotaSize[],
  quotaStorage: QuotaSize[],
}

export const getCNQuotaOptions = async (clusterNamespace: ClusterNamespace): Promise<QuotaOptionsObject> => {
  const { namespaceId, clusterId, provisioned, quotaCpu, quotaMemory, quotaStorage } = clusterNamespace;

  const quotaOptionsObj: QuotaOptionsObject = {
    namespaceId,
    clusterId,
    quotaCpu: new Array(),
    quotaMemory: new Array(),
    quotaStorage: new Array(),
  };

  if (!provisioned) {
    return quotaOptionsObj;
  }

  try {
    const namespace = await NamespaceModel.findById(Number(namespaceId));
    const existingRequests = await RequestModel.findForProfile(namespace.profileId);

    if (existingRequests.length > 0) {
      return quotaOptionsObj;
    }

    const checkedSpec = { quotaCpu, quotaMemory, quotaStorage };
    for (const i of Object.keys(checkedSpec)) {
      const currentSize: QuotaSize = checkedSpec[i];
      const num: number = quotaSizeNames.indexOf(currentSize);
      // allows current size itself, +1 size and all the smaller sizes
      const allowedSizes = quotaSizeNames.slice(
        0, (num + 2 <= quotaSizeNames.length) ? (num + 2) : quotaSizeNames.length);
      quotaOptionsObj[i] = allowedSizes;
    }

    return quotaOptionsObj;
  } catch (err) {
    const message = `Unable to get clusterNamespaces quota options for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    throw err;
  }
};

export const getNamespaceSetQuotaOptions = async (namespaceSet: ProjectNamespace[], clusterName: string): Promise<QuotaOptionsObject[] | undefined> => {
  try {
    let cluster;
    if (!clusterName) {
      cluster = await getDefaultCluster();
    } else {
      cluster = await ClusterModel.findByName(clusterName);
      if (!cluster) {
        const errmsg = `Cant find given cluster name ${clusterName}`;
        throw new Error(errmsg);
      }
    }

    const promises: Promise<ClusterNamespace>[] = [];
    namespaceSet.forEach(namespace => {
      // @ts-ignore
      promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, cluster.id));
    });

    const clusterNamespaces = await Promise.all(promises);
    if (!clusterNamespaces) {
      const errmsg = `Cant fetch clusterNamespaces`;
      throw new Error(errmsg);
    }

    const quotaOptionsPromises: Promise<QuotaOptionsObject>[] = [];
    clusterNamespaces.forEach(cn => quotaOptionsPromises.push(getCNQuotaOptions(cn)));
    return await Promise.all(quotaOptionsPromises);
  } catch (err) {
    const message = `Unable to get clusterNamespaces for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    return;
  }
};

export const validateQuotaRequestBody = (quotaOptions: QuotaOptionsObject[], body: any): void | Error => {
  try {
    body.forEach((item: any) => {
      const rv = validateObjProps(spec.concat(['clusterId', 'namespaceId']), item);
      if (rv) {
        throw rv;
      }

      const { clusterId, namespaceId } = item;
      const quotaOption = quotaOptions.filter(option =>
        (option.clusterId === clusterId) && (option.namespaceId === namespaceId));
      if (!quotaOption) {
        throw new Error(`Cant fetch quotaOption for clusterId ${clusterId} and namespaceId ${namespaceId}`);
      }

      const qo = quotaOption.pop();
      spec.forEach(specName => {
        const requestedSize: QuotaSize = item[specName];
        if (!quotaSizeNames.includes(requestedSize)) {
          throw new Error('Incorrect requested quota size');
        }
        // @ts-ignore
        const allowedSizes: QuotaSize[] = qo[specName];
        if (!allowedSizes.includes(requestedSize)) {
          throw new Error('Requested quota size not allowed');
        }
      });
    });
    return;
  } catch (err) {
    const message = `Invalid quota request body passed in for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    throw err;
  }
};

export const processProfileNamespacesEditType = async (request: Request): Promise<void> => {
  try {
    const { editObject } = request;
    const namespaces = JSON.parse(editObject);

    const updatePromises: any = [];
    namespaces.forEach((namespace: ProjectNamespace) => {
      if (!namespace.clusters) {
        throw new Error();
      }

      // convert JSON-NamespaceCNObject to ClusterNamespace
      const NamespaceCNs: any[] = namespace.clusters;
      NamespaceCNs.forEach((NamespaceCN: NamespaceCNObject) => {
        const { namespaceId, clusterId, quotas: { cpu, memory, storage } } = NamespaceCN;
        const cn = {
          namespaceId, clusterId,
          quotaCpu: cpu,
          quotaMemory: memory,
          quotaStorage: storage,
        }
        // @ts-ignore
        updatePromises.push(NamespaceModel.updateClusterNamespaceQuota(namespace.namespaceId, cn.clusterId, cn));
      });
    });

    await Promise.all(updatePromises);
    return;
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    throw err;
  }
};
