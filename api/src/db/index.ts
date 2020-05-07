import { Pool } from 'pg';
import NamespaceModel from './model/namespace';
import ProfileModel from './model/profile';

export default class DataManager {
  pool: Pool;
  ProfileModel: ProfileModel;
  NamespaceModel: NamespaceModel;

  constructor(config: any) {
    const params = {
      host: config.get('db:host'),
      port: config.get('db:port'),
      database: config.get('db:database'),
      user: config.get('db:user'),
      password: config.get('db:password'),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }

    this.pool = new Pool(params)
    this.ProfileModel = new ProfileModel(this.pool);
    this.NamespaceModel = new NamespaceModel(this.pool);
  }
}
