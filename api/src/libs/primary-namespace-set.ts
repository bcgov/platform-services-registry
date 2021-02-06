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

import { logger } from '@bcgov/common-nodejs-utils';
import DataManager from '../db';
import { Cluster } from '../db/model/cluster';
import { ClusterNamespace, ProjectNamespace } from '../db/model/namespace';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { NamespaceModel, ClusterModel } = dm;

export const isProfileProvisioned = async (profile: ProjectProfile): Promise<boolean | Error> => {
  try {
    const clusterNamespaces = await getPrimaryNamespaceSet(profile);

    // @ts-ignore
    const flags: boolean[] = clusterNamespaces.map((clusterNamespace: ClusterNamespace): boolean => {
      return clusterNamespace.provisioned;
    });

    if (flags.every(f => f === true)) {
      return true;
    } else if (flags.every(f => f === false)) {
      return false;
    } else {
      throw new Error(`Need to fix profile as the primary namespace set
      on ${profile.primaryClusterName} is not consistent`);
    }
  } catch (err) {
    const message = `Unable to determin if profile ${profile.id} is provisioned`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getCurrentQuotaSize = async (profile: ProjectProfile): Promise<QuotaSize> => {
  try {
    const clusterNamespaces = await getPrimaryNamespaceSet(profile);
    const quotaSizes: QuotaSize[] = [];
    clusterNamespaces.forEach((clusterNamespace: ClusterNamespace): any => {
      const { quotaCpuSize, quotaMemorySize, quotaStorageSize } = clusterNamespace;
      quotaSizes.push(quotaCpuSize, quotaMemorySize, quotaStorageSize);
    })

    const hasSameQuotaSizes = (quotaSizes.every((val, i, arr) => val === arr[0]));
    if (hasSameQuotaSizes) {
      return quotaSizes[0];
    } else {
      throw new Error(`Need to fix profile as the quota sizes of primary namespace set
      on ${profile.primaryClusterName} are not consistent`);
    }
  } catch (err) {
    const message = `Unable to get quota size for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getQuotaOptions = async (profile: ProjectProfile): Promise<QuotaSize[]> => {
  const quotaSizeNames = Object.values(QuotaSize);

  try {
    const allQuotaOptions = [QuotaSize.Small, QuotaSize.Medium, QuotaSize.Large];
    const currentSize = await getCurrentQuotaSize(profile);
    const num: number = quotaSizeNames.indexOf(currentSize);

    // allows +1 size and all the smaller sizes
    return allQuotaOptions.slice(
      0, (num + 2 <= allQuotaOptions.length) ? (num + 2) : allQuotaOptions.length).filter(
        size => size !== currentSize
      );
  } catch (err) {
    const message = `Unable to get quota size for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

interface QuotaData {
  quotaCpuSize: QuotaSize,
  quotaMemorySize: QuotaSize,
  quotaStorageSize: QuotaSize,
}

export const applyRequestedQuotaSize = async (profile: ProjectProfile, quotaSize: QuotaSize): Promise<void | Error> => {
  try {
    const clusterNamespaces = await getPrimaryNamespaceSet(profile);
    const updatePromises: any = [];

    const data: QuotaData = {
      quotaCpuSize: quotaSize,
      quotaMemorySize: quotaSize,
      quotaStorageSize: quotaSize,
    }

    clusterNamespaces.forEach((clusterNamespace: ClusterNamespace): any => {
      // @ts-ignore
      updatePromises.push(NamespaceModel.updateQuotaSize(clusterNamespace.namespaceId, clusterNamespace.clusterId, data));
    });

    await Promise.all(updatePromises);
  } catch (err) {
    const message = `Unable to get quota size for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getDefaultCluster = async (): Promise<Cluster | Error> => {
  try {
    const clusters = await ClusterModel.findAll();
    return clusters.filter(c => c.isDefault === true).pop();
  } catch (err) {
    const message = 'Unable to get default cluster';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const getPrimaryNamespaceSet = async (profile: ProjectProfile): Promise<ClusterNamespace[]> => {
  try {
    const primaryCluster = await ClusterModel.findByName(profile.primaryClusterName);
    // @ts-ignore
    const namespaces: ProjectNamespace[] = await NamespaceModel.findForProfile(profile.id);
    if (!primaryCluster || !namespaces) {
      throw new Error('Unable to find primary cluster or namespaces');
    }

    const promises: Promise<ClusterNamespace>[] = [];
    namespaces.forEach(namespace => {
      // @ts-ignore
      promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, primaryCluster.id));
    });
    return await Promise.all(promises);
  } catch (err) {
    const message = 'Unable to get primary namespace set for the profile';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
