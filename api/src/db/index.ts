import { Pool } from 'pg';
import Profile from './model/profile';
export default class DataManager {
  pool: Pool;
  Profile: Profile;

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
    // console.log(Pool);
    this.Profile = new Profile(this.pool);
  }
}
