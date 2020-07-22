import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { projectSetNames } from '../../constants';
import { CommonFields, Model } from './model';

export interface ProjectNamespace extends CommonFields {
  name: string,
  profileId: number,
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

  async createProjectSet(profileId: number, clusterId: number, prefix: string,): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        INSERT INTO cluster_namespace
          (namespace_id, cluster_id)
          VALUES ($1, $2) RETURNING *;`,
      values: [],
    };
    try {
      const names = projectSetNames.map(n => `${prefix}-${n}`);
      const nsPromises = names.map(name => this.create({
        name,
        profileId,
      }));

      const nsResults = await Promise.all(nsPromises);
      const clPromises = nsResults.map(nr => this.runQuery({ ...query, values: [nr.id, clusterId] }));
      const clResults = await Promise.all(clPromises);

      console.log(nsResults, clResults)

      return nsResults;
    } catch (err) {
      const message = `Unable to create namespace set`;
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
        FROM namespace WHERE namespace.profile_id = $1;
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
      const message = `Unable to create namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

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
      const message = `Unable to archive namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };
}
