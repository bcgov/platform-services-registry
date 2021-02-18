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
const { NamespaceModel } = dm;

export const isNamespaceSetProvisioned = async (profile: ProjectProfile, cluster: Cluster): Promise<boolean> => {
  try {
    const clusterNamespaces = await getNamespaceSet(profile, cluster);

    // @ts-ignore
    const flags: boolean[] = clusterNamespaces.map((clusterNamespace: ClusterNamespace): boolean => {
      return clusterNamespace.provisioned;
    });

    if (flags.every(f => f === true)) {
      return true;
    } else if (flags.every(f => f === false)) {
      return false;
    } else {
      throw new Error(`Need to fix entries as the provisioning status of
      namespace set is not consistent`);
    }
  } catch (err) {
    const message = `Unable to determine if namespace set
    on ${cluster.name} cluster for profile ${profile.id} is provisioned`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const applyNamespaceSetProvisioningStatus = async (profile: ProjectProfile, cluster: Cluster, provisoningStatus: boolean): Promise<void> => {
  try {
    const namespaces = await NamespaceModel.findForProfile(Number(profile.id));
    const clusterId = cluster.id;
    if (!namespaces || (typeof clusterId !== 'number')) {
      throw new Error('Unable to find namespaces or cluster id');
    }

    const promises: any = [];
    namespaces.forEach(namespace => {
      // @ts-ignore
      const { namespaceId } = namespace;
      promises.push(NamespaceModel.updateProvisionStatus(namespaceId, clusterId, provisoningStatus));
    });

    await Promise.all(promises);

  } catch (err) {
    const message = `Unable to apply provisioning status ${provisoningStatus}
    on namespace set on ${cluster.name} cluster for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getCurrentQuotaSize = async (profile: ProjectProfile, cluster: Cluster): Promise<QuotaSize> => {
  try {
    const clusterNamespaces = await getNamespaceSet(profile, cluster);
    const quotaSizes: QuotaSize[] = [];
    clusterNamespaces.forEach((clusterNamespace: ClusterNamespace): any => {
      const { quotaCpuSize, quotaMemorySize, quotaStorageSize } = clusterNamespace;
      quotaSizes.push(quotaCpuSize, quotaMemorySize, quotaStorageSize);
    })

    const hasSameQuotaSizes = (quotaSizes.every((val, i, arr) => val === arr[0]));
    if (hasSameQuotaSizes) {
      return quotaSizes[0];
    } else {
      throw new Error(`Need to fix entries as the quota size of
      namespace set is not consistent`);
    }
  } catch (err) {
    const message = `Unable to get quota size for namespace set
    on ${cluster.name} cluster for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

interface QuotaData {
  quotaCpuSize: QuotaSize,
  quotaMemorySize: QuotaSize,
  quotaStorageSize: QuotaSize,
}

export const applyRequestedQuotaSize = async (profile: ProjectProfile, cluster: Cluster, quotaSize: QuotaSize): Promise<void> => {
  try {
    const clusterNamespaces = await getNamespaceSet(profile, cluster);
    const updatePromises: any = [];

    const data: QuotaData = {
      quotaCpuSize: quotaSize,
      quotaMemorySize: quotaSize,
      quotaStorageSize: quotaSize,
    }

    clusterNamespaces.forEach((clusterNamespace: ClusterNamespace): any => {
      updatePromises.push(NamespaceModel.updateQuotaSize(
        // @ts-ignore
        clusterNamespace.namespaceId, clusterNamespace.clusterId, data)
      );
    });

    await Promise.all(updatePromises);
  } catch (err) {
    const message = `Unable to apply quota size for namespace set
    on ${cluster.name} cluster for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const getNamespaceSet = async (profile: ProjectProfile, cluster: Cluster): Promise<ClusterNamespace[]> => {
  try {
    // @ts-ignore
    const namespaces: ProjectNamespace[] = await NamespaceModel.findForProfile(profile.id);
    if (!namespaces) {
      throw new Error('Unable to find namespaces');
    }

    const promises: Promise<ClusterNamespace>[] = [];
    namespaces.forEach(namespace => {
      // @ts-ignore
      promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, cluster.id));
    });
    return await Promise.all(promises);
  } catch (err) {
    const message = 'Unable to get namespace set for the given profile and cluster';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
