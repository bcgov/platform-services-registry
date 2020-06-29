import { Pool } from 'pg';
import ContactModel from './model/contact';
import NamespaceModel from './model/namespace';
import ProfileModel from './model/profile';

export default class DataManager {
  pool: Pool;
  ProfileModel: ProfileModel;
  NamespaceModel: NamespaceModel;
  ContactModel: ContactModel;

  constructor(pool: Pool) {
    this.pool = pool;
    this.ProfileModel = new ProfileModel(pool);
    this.NamespaceModel = new NamespaceModel(pool);
    this.ContactModel = new ContactModel(pool);
  }
}
