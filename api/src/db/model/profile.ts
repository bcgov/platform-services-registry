import Model from './model';

// interface ProfileModel {
//   name: string,
//   description: string,
//   createdAt: object,
//   updated: object,
// }

export default class Profile extends Model {
  table: string = 'profile';
  pool: any;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }
}
