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

export enum QuotaSizeQueryRef {
  CPUQuery = "CPUQuery",
  MemoryQuery = "MemoryQuery",
  StorageQuery = "StorageQuery",
  SnapshotQuery = "SnapshotQuery",
}
export interface NamespaceQuotaSize {
  quotaCpuSize: string;
  quotaMemorySize: string;
  quotaStorageSize: string;
  quotaSnapshotSize: string;
}
export interface ProjectQuotaSize {
  dev: NamespaceQuotaSize;
  test: NamespaceQuotaSize;
  tools: NamespaceQuotaSize;
  prod: NamespaceQuotaSize;
}

export interface Quotas {
  cpu: {
    requests: number;
    limits: number;
  };
  memory: {
    requests: string;
    limits: string;
  };
  storage: {
    block: string;
    file: string;
    backup: string;
    capacity: string;
    pvcCount: number;
  };
  snapshot: { count: number };
}

export interface ProjectSetQuotas {
  dev: Quotas;
  test: Quotas;
  tools: Quotas;
  prod: Quotas;
}

interface CPUQuotaSizeDedetail {
  name: string;
  cpuNums: string[];
}

interface MemoryQuotaSizeDedetail {
  name: string;
  memoryNums: string[];
}

interface StorageQuotaSizeDedetail {
  name: string;
  storageNums: string[];
}

interface SnapshotQuotaSizeDedetail {
  name: string;
  snapshotNums: number;
}
interface NewQuotaSizeDedetails {
  CPU_QuotaSize_Detail: CPUQuotaSizeDedetail[];
  Memory_QuotaSize_Detail: MemoryQuotaSizeDedetail[];
  Storage_QuotaSize_Detail: StorageQuotaSizeDedetail[];
  Snapshot_QuotaSize_Detail: SnapshotQuotaSizeDedetail[];
}

const DEFAULT_NAMESPACE_QUOTAS: Quotas = {
  cpu: {
    requests: 4,
    limits: 8,
  },
  memory: {
    requests: "16 Gi",
    limits: "32 Gi",
  },
  storage: {
    block: "50Gi",
    file: "50Gi",
    backup: "25Gi",
    capacity: "50Gi",
    pvcCount: 20,
  },
  snapshot: { count: 5 },
};

export interface Quota extends CommonFields {
  cpuRequests: number;
  cpuLimits: number;
  memoryRequests: string;
  memoryLimits: string;
  storageBlock: string;
  storageFile: string;
  storageBackup: string;
  storageCapacity: string;
  storagePvcCount: number;
  snapshotVolume: number;
}

export default class QuotaModel extends Model {
  table: string = "ref_cpu_quota";

  requiredFields: string[] = [
    "cpu_requests",
    "cpu_limits",
    "memory_requests",
    "memory_limits",
    "storage_block",
    "storage_file",
    "storage_backup",
    "storage_capacity",
    "storage_pvc_count",
  ];

  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  // eslint-disable-next-line class-methods-use-this
  async create(): Promise<any> {
    // this is intentional (required by Sonarcloud)
  }

  // eslint-disable-next-line class-methods-use-this
  async update(): Promise<any> {
    // this is intentional (required by Sonarcloud)
  }

  // eslint-disable-next-line class-methods-use-this
  async delete(): Promise<any> {
    // this is intentional (required by Sonarcloud)
  }

  async getAllQuotaRef(resourceType: string): Promise<any[]> {
    const queryMap = {
      CPUQuery: {
        text: `SELECT id FROM ref_cpu_quota;`,
      },
      MemoryQuery: {
        text: `SELECT id FROM ref_memory_quota;`,
      },
      StorageQuery: {
        text: `SELECT id FROM ref_storage_quota;`,
      },
      SnapshotQuery: {
        text: `SELECT id FROM ref_snapshot_quota;`,
      },
    };

    try {
      const queryResult = await this.runQuery(queryMap[resourceType]);
      const allAvailableQuotaSize: String[] = queryResult.map(
        (resourceName) => resourceName.id
      );
      return allAvailableQuotaSize;
    } catch (err) {
      const message = `Unable to fetch cpu quota ref`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findQuota(): Promise<any[]> {
    const query = {
      text: `
          SELECT * FROM ${this.table};
          `,
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch all Quota`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findResourceQuotaRef(resourceType: string): Promise<any[]> {
    const queryMap = {
      CPUQuery: {
        text: `SELECT id, cpu_requests, cpu_limits FROM ref_cpu_quota;`,
      },
      MemoryQuery: {
        text: `SELECT id, memory_requests, memory_limits FROM ref_memory_quota;`,
      },
      StorageQuery: {
        text: `SELECT id, storage_pvc_count, storage_File , storage_backup FROM ref_storage_quota;`,
      },
      SnapshotQuery: {
        text: `SELECT id, snapshot_volume FROM ref_snapshot_quota;`,
      },
    };
    try {
      return await this.runQuery(queryMap[resourceType]);
    } catch (err) {
      const message = `Unable to fetch cpu quota ref`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findQuotaSizes(): Promise<any> {
    try {
      const newQuotaSizeDedetails = {
        CPU_QuotaSize_Detail:
          (await this.findResourceQuotaRef("CPUQuery")) || [],
        Memory_QuotaSize_Detail:
          (await this.findResourceQuotaRef("MemoryQuery")) || [],
        Storage_QuotaSize_Detail:
          (await this.findResourceQuotaRef("StorageQuery")) || [],
        Snapshot_QuotaSize_Detail:
          (await this.findResourceQuotaRef("SnapshotQuery")) || [],
      };

      const formatedQuotaSizeDedetails: NewQuotaSizeDedetails = {
        CPU_QuotaSize_Detail: [],
        Memory_QuotaSize_Detail: [],
        Storage_QuotaSize_Detail: [],
        Snapshot_QuotaSize_Detail: [],
      };

      newQuotaSizeDedetails.CPU_QuotaSize_Detail.forEach((CPUOption) => {
        formatedQuotaSizeDedetails.CPU_QuotaSize_Detail.push({
          name: CPUOption.id,
          cpuNums: [CPUOption.cpuRequests, CPUOption.cpuLimits],
        });
      });
      newQuotaSizeDedetails.Memory_QuotaSize_Detail.forEach((memoryOption) => {
        formatedQuotaSizeDedetails.Memory_QuotaSize_Detail.push({
          name: memoryOption.id,
          memoryNums: [
            memoryOption.memoryRequests.replace("Gi", "GiB"),
            memoryOption.memoryLimits.replace("Gi", "GiB"),
          ],
        });
      });
      newQuotaSizeDedetails.Storage_QuotaSize_Detail.forEach(
        (storageOption) => {
          formatedQuotaSizeDedetails.Storage_QuotaSize_Detail.push({
            name: storageOption.id,
            storageNums: [
              storageOption.storagePvcCount,
              storageOption.storageFile.replace("Gi", "GiB"),
              storageOption.storageBackup.replace("Gi", "GiB"),
            ],
          });
        }
      );
      newQuotaSizeDedetails.Snapshot_QuotaSize_Detail.forEach(
        (snapshotOption) => {
          formatedQuotaSizeDedetails.Snapshot_QuotaSize_Detail.push({
            name: snapshotOption.id,
            snapshotNums: snapshotOption.snapshotVolume,
          });
        }
      );
      return formatedQuotaSizeDedetails;
    } catch (err) {
      const message = `Unable to get quota sizes`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async fetchProjectSetQuotaDetail(
    quotaSize: ProjectQuotaSize
  ): Promise<ProjectSetQuotas> {
    const projectSetQuotaSize: ProjectSetQuotas = {
      dev: DEFAULT_NAMESPACE_QUOTAS,
      test: DEFAULT_NAMESPACE_QUOTAS,
      tools: DEFAULT_NAMESPACE_QUOTAS,
      prod: DEFAULT_NAMESPACE_QUOTAS,
    };
    try {
      await Promise.all(
        Object.keys(quotaSize).map(async (namespace) => {
          projectSetQuotaSize[namespace] = await this.findQuotaSizeForNamespace(
            quotaSize[namespace]
          );
        })
      );
      return projectSetQuotaSize;
    } catch (err) {
      const message = `Unable to retrieve Project set Quota Size`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findQuotaSizeForNamespace(
    quotaSize: NamespaceQuotaSize
  ): Promise<Quotas> {
    const query = {
      text: `
                SELECT json_build_object(
                    'cpu', (SELECT row_to_json(d) FROM (SELECT cpu_requests AS "requests", cpu_limits AS "limits"
                        FROM ref_cpu_quota WHERE id = $1) d),
                    'memory', (SELECT row_to_json(d) FROM (SELECT memory_requests AS "requests", memory_limits AS "limits"
                        FROM ref_memory_quota WHERE id = $2) d),
                    'storage', (SELECT row_to_json(d) FROM (SELECT storage_block AS "block", storage_file AS "file", storage_backup AS "backup", storage_capacity AS "capacity", storage_pvc_count AS "pvcCount"
                        FROM ref_storage_quota WHERE id = $3) d),
                    'snapshot', (SELECT row_to_json(d) FROM (SELECT snapshot_volume AS "count"
                        FROM ref_snapshot_quota WHERE id = $4) d)
                );
                `,
      values: [],
    };

    try {
      const results = await this.runQuery({
        ...query,
        values: [
          quotaSize.quotaCpuSize,
          quotaSize.quotaMemorySize,
          quotaSize.quotaStorageSize,
          quotaSize.quotaSnapshotSize,
        ],
      });
      return results.pop().jsonBuildObject;
    } catch (err) {
      const message = `Unable to retrieve quotas object by size ${quotaSize}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
