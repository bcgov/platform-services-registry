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
import { ProjectNamespace } from '../db/model/namespace';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { NamespaceModel, ClusterModel } = dm;

export const getProvisionStatus = async (profile: ProjectProfile): Promise<boolean> => {
  try {
    const primaryCluster: Cluster = await ClusterModel.findByName(profile.primaryClusterName);
    if (!primaryCluster.id || !profile.id) {
      throw new Error('Unable to get primary cluster id or profile id');
    }

    return await NamespaceModel.getProjectSetProvisionStatus(profile.id, primaryCluster.id);
  } catch (err) {
    const message = `Unable to determine if profile ${profile.id} is provisioned`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const updateProvisionStatus = async (profile: ProjectProfile, provisionStatus: boolean): Promise<void> => {
  try {
    const primaryCluster: Cluster = await ClusterModel.findByName(profile.primaryClusterName);
    if (!primaryCluster.id || !profile.id) {
      throw new Error('Unable to get primary cluster id or profile id');
    }

    await NamespaceModel.updateProjectSetProvisionStatus(profile.id, primaryCluster.id, provisionStatus);
  } catch (err) {
    const message = `Unable to update provisioned profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const getQuotaSize = async (profile: ProjectProfile): Promise<QuotaSize> => {
  try {
    const clusters: Cluster[] = await getClusters(profile);

    const promises: any = [];
    clusters.forEach((cluster: Cluster) => {
      if (!profile.id || !cluster.id) {
        throw new Error('Unable to get profile id or cluster id');
      }

      promises.push(NamespaceModel.getProjectSetQuotaSize(profile.id, cluster.id));
    })

    const quotaSizes: QuotaSize[] = await Promise.all(promises);
    const hasSameQuotaSizes = (quotaSizes.every((val, i, arr) => val === arr[0]));
    if (hasSameQuotaSizes) {
      return quotaSizes[0];
    } else {
      throw new Error(`Need to fix entries as the quota size of cluster namespaces
      under the profile is not consistent`);
    }
  } catch (err) {
    const message = `Unable to get quota size for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const updateQuotaSize = async (profile: ProjectProfile, quotaSize: QuotaSize): Promise<void> => {
  try {
    const clusters: Cluster[] = await getClusters(profile);

    const promises: any = []
    clusters.forEach((cluster: Cluster) => {
      if (!profile.id || !cluster.id) {
        throw new Error('Unable to get profile id or cluster id');
      }

      promises.push(NamespaceModel.updateProjectSetQuotaSize(profile.id, cluster.id, quotaSize));
    })

    await Promise.all(promises);
  } catch (err) {
    const message = `Unable to apply quota size ${quotaSize} for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const getClusters = async (profile: ProjectProfile): Promise<Cluster[]> => {
  try {
    if (!profile.id) {
      throw new Error('Cant get profile id');
    }
    const namespaces: ProjectNamespace[] = await NamespaceModel.findForProfile(profile.id);
    if (!namespaces) {
      throw new Error('Unable to find namespaces');
    }

    const promises: Promise<Cluster>[] = [];
    // clusters field is not natively from NamespaceModel but results from findForProfile
    // @ts-ignore
    const { clusters } = namespaces[0];
    clusters?.map(cluster => {
      promises.push(ClusterModel.findById(cluster.clusterId));
    });

    return await Promise.all(promises);
  } catch (err) {
    const message = 'Unable to get all clusters for the profile';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
