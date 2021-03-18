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

'use strict';

import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { projectSetNames } from '../../constants';
import { CommonFields, Model } from './model';
import { QuotaSize } from './quota';

<<<<<<< HEAD
// TODO:(yh) make quota_cpu_size, quota_memory_size, quota_storage_size NOT NULL
// and to delete quota_cpu, quota_memory and quota_storage from ref_quota table
interface ClusterNamespace extends CommonFields {
=======
export interface ClusterNamespace extends CommonFields {
>>>>>>> e185d52 (db schema update for multi-cluster support)
  namespaceId: number;
  clusterId: number;
  provisioned: boolean;
  quotaCpuSize: QuotaSize;
  quotaMemorySize: QuotaSize;
  quotaStorageSize: QuotaSize;
}

export interface ProjectNamespace extends CommonFields {
  name: string;
  profileId: number;
}

export default class NamespaceModel extends Model {
  table: string = 'namespace';
  requiredFields: string[] = [
    'name',
    'profileId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: ProjectNamespace): Promise<ProjectNamespace> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (name, profile_id)
          VALUES ($1, $2) RETURNING *;`,
      values: [
        data.name,
        data.profileId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(namespaceId: number, data: ProjectNamespace): Promise<ProjectNamespace> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, profile_id = $2, cluster_id = $3
          WHERE id = ${namespaceId}
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(namespaceId);
      const aData = { ...record, ...data };
      query.values = [
        aData.name,
        aData.profileId,
        aData.clusterId,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update namespace ${namespaceId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async delete(namespaceId: number): Promise<ProjectNamespace> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = ${namespaceId}
          RETURNING *;
      `,
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive namespace ${namespaceId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async createProjectSet(profileId: number, clusterId: number, prefix: string,): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        INSERT INTO cluster_namespace
          (namespace_id, cluster_id, quota_cpu_size, quota_memory_size, quota_storage_size)
          VALUES ($1, $2, $3, $3, $3) RETURNING *;`,
      values: [],
    };
    try {
      const names = projectSetNames.map(n => `${prefix}-${n}`);
      const nsPromises = names.map(name => this.create({
        name,
        profileId,
      }));

      const nsResults = await Promise.all(nsPromises);
      // default quota size set to QuotaSize.Small
      const clPromises = nsResults.map(nr => this.runQuery({ ...query, values: [nr.id, clusterId, QuotaSize.Small] }));
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to create namespace set`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async getProjectSetProvisionStatus(profileId: number, clusterId: number): Promise<boolean> {
    const query = {
      text: `
        SELECT provisioned FROM cluster_namespace
          WHERE namespace_id = $1 AND cluster_id = $2;`,
      values: [],
    };

    try {
      const nsResults: ProjectNamespace[] = await this.findNamespacesForProfile(profileId);
      const clPromises: Promise<ClusterNamespace[]>[] = nsResults.map(nr => this.runQuery({ ...query, values: [nr.id, clusterId] }));
      const clResults: ClusterNamespace[][] = await Promise.all(clPromises);

      const clusterNamespaces = clResults.map((cl: ClusterNamespace[]) => cl.pop());
      const flags: (boolean | undefined)[] = clusterNamespaces.map((cl: (ClusterNamespace | undefined)): boolean | undefined => {
        return cl ? cl.provisioned : undefined;
      });

      if (flags.every(f => f === true)) {
        return true;
      } else if (flags.every(f => f === false)) {
        return false;
      } else {
        throw new Error(`Need to fix entries as the provisioning status of
        the project set is not consistent`);
      }
    } catch (err) {
      const message = `Unable to update provisioning status of the project set for profile ${profileId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async updateProjectSetProvisionStatus(profileId: number, clusterId: number, provisioned: boolean): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        UPDATE cluster_namespace
          SET provisioned = $1
          WHERE namespace_id = $2 AND cluster_id = $3
        RETURNING *;`,
      values: [],
    };

    try {
      const nsResults: ProjectNamespace[] = await this.findNamespacesForProfile(profileId);
      const clPromises: Promise<ClusterNamespace[]>[] = nsResults.map(nr => this.runQuery({ ...query, values: [provisioned, nr.id, clusterId] }));
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to update provisioning status of the project set for profile ${profileId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async getProjectSetQuotaSize(profileId: number, clusterId: number): Promise<QuotaSize> {
    const query = {
      text: `
        SELECT quota_cpu_size, quota_memory_size, quota_storage_size FROM cluster_namespace
          WHERE namespace_id = $1 AND cluster_id = $2;`,
      values: [],
    };

    try {
      const nsResults: ProjectNamespace[] = await this.findNamespacesForProfile(profileId);
      const clPromises: Promise<ClusterNamespace[]>[] = nsResults.map(nr => this.runQuery({ ...query, values: [nr.id, clusterId] }));
      const clResults: ClusterNamespace[][] = await Promise.all(clPromises);

      const clusterNamespaces: (ClusterNamespace | undefined)[] = clResults.map(cl => cl.pop());
      const quotaSizes: QuotaSize[] = [];
      clusterNamespaces.forEach((clusterNamespace: (ClusterNamespace | undefined)): void => {
        if (!clusterNamespace) {
          return;
        }
        const { quotaCpuSize, quotaMemorySize, quotaStorageSize } = clusterNamespace;
        quotaSizes.push(quotaCpuSize, quotaMemorySize, quotaStorageSize);
      })

      const hasSameQuotaSizes: boolean = (quotaSizes.every((val, i, arr) => val === arr[0]));
      if (hasSameQuotaSizes) {
        return quotaSizes[0];
      } else {
        throw new Error(`Need to fix entries as the quota size of
        the project set is not consistent`);
      }
    } catch (err) {
      const message = `Unable to get quota size of the project set for profile ${profileId} on cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async updateProjectSetQuotaSize(profileId: number, clusterId: number, quotaSize: QuotaSize): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        UPDATE cluster_namespace
          SET quota_cpu_size = $1, quota_memory_size = $1, quota_storage_size = $1
          WHERE namespace_id = $2 AND cluster_id = $3
        RETURNING *;`,
      values: [],
    };

    try {
      const nsResults = await this.findNamespacesForProfile(profileId);
      const clPromises = nsResults.map(nr => this.runQuery({ ...query, values: [quotaSize, nr.id, clusterId] }));
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to update quota size of the project set for profile ${profileId} on cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findForProfile(profileId: number): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        SELECT namespace.id AS "namespaceId", namespace.name,
        coalesce(
          (
            SELECT array_to_json(array_agg(row_to_json(x)))
            FROM (
              SELECT ref_cluster.id AS "clusterId", ref_cluster.name, cluster_namespace.provisioned
              FROM ref_cluster JOIN cluster_namespace ON ref_cluster.id = cluster_namespace.cluster_id
              WHERE namespace.id = cluster_namespace.namespace_id
            ) x
          ),
          '[]'
        ) AS clusters
        FROM ${this.table} WHERE namespace.profile_id = $1;
      `,
      values: [
        profileId,
      ],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  private async findNamespacesForProfile(profileId: number): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE profile_id = $1 AND archived = false;`,
      values: [profileId],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to find namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
