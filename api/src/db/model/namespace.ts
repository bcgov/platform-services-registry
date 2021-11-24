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

import { logger } from "@bcgov/common-nodejs-utils";
import { Pool } from "pg";
import { CommonFields, Model } from "./model";
import { getLicenseplatPostfix } from "../../libs/utils";
import { ProjectQuotaSize, QuotaSize, NamespaceQuotaSize } from "./quota";

export interface ClusterNamespace extends CommonFields {
  namespaceId: number;
  clusterId: number;
  provisioned: boolean;
  quotaCpuSize: QuotaSize;
  quotaMemorySize: QuotaSize;
  quotaStorageSize: QuotaSize;
  quotaSnapshotSize: QuotaSize;
}

export interface ProjectNamespace extends CommonFields {
  name: string;
  profileId: number;
  clusters?: any;
}
export interface NameSpacesQuotaSize {
  quotaCpuSize: QuotaSize[];
  quotaMemorySize: QuotaSize[];
  quotaStorageSize: QuotaSize[];
  quotaSnapshotSize: QuotaSize[];
}
export interface ProjectSetAllowedQuotaSize {
  dev: NameSpacesQuotaSize;
  test: NameSpacesQuotaSize;
  tools: NameSpacesQuotaSize;
  prod: NameSpacesQuotaSize;
}
export default class NamespaceModel extends Model {
  table: string = "namespace";

  requiredFields: string[] = ["name", "profileId"];

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
      values: [data.name, data.profileId],
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

  async update(
    namespaceId: number,
    data: ProjectNamespace
  ): Promise<ProjectNamespace> {
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
      query.values = [aData.name, aData.profileId, aData.clusterId];

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

  async createProjectSet(
    clusterId: number,
    nsResults: any
  ): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        INSERT INTO cluster_namespace
          (namespace_id, cluster_id, quota_cpu_size, quota_memory_size, quota_storage_size)
          VALUES ($1, $2, $3, $3, $3) RETURNING *;`,
      values: [],
    };
    try {
      // default quota size set to QuotaSize.Small
      const clPromises = nsResults.map((nr) =>
        this.runQuery({ ...query, values: [nr.id, clusterId, QuotaSize.Small] })
      );
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to create namespace set`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async getProjectSetProvisionStatus(
    profileId: number,
    clusterId: number
  ): Promise<boolean> {
    const query = {
      text: `
        SELECT provisioned FROM cluster_namespace
          WHERE namespace_id = $1 AND cluster_id = $2;`,
      values: [],
    };

    try {
      const nsResults: ProjectNamespace[] = await this.findNamespacesForProfile(
        profileId
      );
      const clPromises: Promise<ClusterNamespace[]>[] = nsResults.map((nr) =>
        this.runQuery({ ...query, values: [nr.id, clusterId] })
      );
      const clResults: ClusterNamespace[][] = await Promise.all(clPromises);

      const clusterNamespaces = clResults.map((cl: ClusterNamespace[]) =>
        cl.pop()
      );
      const flags: (boolean | undefined)[] = clusterNamespaces.map(
        (cl: ClusterNamespace | undefined): boolean | undefined => {
          return cl ? cl.provisioned : undefined;
        }
      );

      if (flags.every((f) => f === true)) {
        return true;
      }
      if (flags.every((f) => f === false)) {
        return false;
      }
      throw new Error(`Need to fix entries as the provisioning status of
        the project set is not consistent`);
    } catch (err) {
      const message = `Unable to update provisioning status of the project set for profile ${profileId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async updateProjectSetProvisionStatus(
    profileId: number,
    clusterId: number,
    provisioned: boolean
  ): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        UPDATE cluster_namespace
          SET provisioned = $1
          WHERE namespace_id = $2 AND cluster_id = $3
        RETURNING *;`,
      values: [],
    };

    try {
      const nsResults: ProjectNamespace[] = await this.findNamespacesForProfile(
        profileId
      );
      const clPromises: Promise<ClusterNamespace[]>[] = nsResults.map((nr) =>
        this.runQuery({ ...query, values: [provisioned, nr.id, clusterId] })
      );
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to update provisioning status of the project set for profile ${profileId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async getProfileNamespaceQuotaSize(
    profileId: number,
    namespace: string
  ): Promise<NamespaceQuotaSize[]> {
    const query = {
      text: `
      SELECT 
      quota_cpu_size,quota_memory_size,quota_storage_size,quota_snapshot_size 
      FROM 
      cluster_namespace RIGHT 
      JOIN namespace ON cluster_namespace.namespace_id = namespace.id 
      WHERE profile_id=$1 AND name=$2 AND archived = false ;`,
      values: [],
    };
    try {
      const result = await this.runQuery({
        ...query,
        values: [profileId, namespace],
      });
      return result;
    } catch (err) {
      const message = `Unable to get quota size namespace of the project set for profile ${profileId} in getProfileNamespaceQuotaSize`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async getProjectSetQuotaSize(
    profileId: number,
    clusterId: number
  ): Promise<any> {
    const query = {
      text: `
      SELECT 
        name as namespaceName, 
        json_build_object(
          'quotaCpuSize', quota_cpu_size, 
          'quotaMemorySize', quota_memory_size, 
          'quotaStorageSize', quota_storage_size, 
          'quotaSnapshotSize', quota_snapshot_size ) as quota_info
    FROM cluster_namespace
    JOIN namespace ON cluster_namespace.namespace_id = namespace.id 
    WHERE namespace.profile_id = $1 AND cluster_namespace.cluster_id = $2;
    `,
      values: [],
    };
    try {
      const ClustersnamespaceQuotaSize = await this.runQuery({
        ...query,
        values: [profileId, clusterId],
      });

      const projectQuotaSize: ProjectQuotaSize = {
        dev: {
          quotaCpuSize: QuotaSize.Small,
          quotaMemorySize: QuotaSize.Small,
          quotaStorageSize: QuotaSize.Small,
          quotaSnapshotSize: QuotaSize.Small,
        },
        test: {
          quotaCpuSize: QuotaSize.Small,
          quotaMemorySize: QuotaSize.Small,
          quotaStorageSize: QuotaSize.Small,
          quotaSnapshotSize: QuotaSize.Small,
        },
        tools: {
          quotaCpuSize: QuotaSize.Small,
          quotaMemorySize: QuotaSize.Small,
          quotaStorageSize: QuotaSize.Small,
          quotaSnapshotSize: QuotaSize.Small,
        },
        prod: {
          quotaCpuSize: QuotaSize.Small,
          quotaMemorySize: QuotaSize.Small,
          quotaStorageSize: QuotaSize.Small,
          quotaSnapshotSize: QuotaSize.Small,
        },
      };
      // TODO cluster duplication only show one
      ClustersnamespaceQuotaSize.forEach((namespaceQuotaInfo) => {
        const namespace = getLicenseplatPostfix(
          namespaceQuotaInfo.namespacename
        );

        try {
          projectQuotaSize[namespace] = namespaceQuotaInfo.quotaInfo;
        } catch (err) {
          const message = `unable to resolve project namespace name for for profile ${profileId} on cluster ${clusterId}`;
          logger.error(`${message}, err = ${err.message}`);
          throw err;
        }
      });
      return projectQuotaSize;
    } catch (err) {
      const message = `Unable to get quota size of the project set for profile ${profileId} on cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  // This will update Specified namespace in all cluster
  async updateNamespaceQuotaSize(
    profileId: number,
    quotaSize: NamespaceQuotaSize,
    namespace: string
  ): Promise<ProjectNamespace[]> {
    const query = {
      text: `
      Update cluster_namespace
      SET quota_cpu_size = $1, quota_memory_size = $2, quota_storage_size = $3
      From namespace
      where
      namespace.name = $4 AND namespace.profile_id = $5 AND namespace.id = cluster_namespace.namespace_id 
      RETURNING *;`,
      values: [],
    };

    try {
      return await this.runQuery({
        ...query,
        values: [
          quotaSize.quotaCpuSize,
          quotaSize.quotaMemorySize,
          quotaSize.quotaStorageSize,
          namespace,
          profileId,
        ],
      });
    } catch (err) {
      const message = `Unable to update quota size of the project namespace ${namespace} for profile ${profileId} on cluster`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
  // update project wide quota size function was removed in https://github.com/bcgov/platform-services-registry/pull/573/files

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
      values: [profileId],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findNamespaceForProfile(
    profileId: number,
    namespace: string
  ): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE profile_id = $1 AND name= $2 AND archived = false;`,
      values: [],
    };

    try {
      return await this.runQuery({ ...query, values: [profileId, namespace] });
    } catch (err) {
      const message = `Unable to find namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findNamespacesForProfile(
    profileId: number
  ): Promise<ProjectNamespace[]> {
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

  async findClustersForProfile(profileId: number): Promise<any[]> {
    const query = {
      text: `
      SELECT DISTINCT ref_cluster.name, ref_cluster.id
        FROM namespace
        JOIN cluster_namespace ON cluster_namespace.namespace_id = namespace.id
        JOIN profile ON profile.id = namespace.profile_id
        JOIN ref_cluster ON  ref_cluster.id = cluster_namespace.cluster_id
        WHERE profile.id = $1 AND profile.archived = false;`,
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
