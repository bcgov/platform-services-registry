
import axios from 'axios';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import DataManager from '../src/db';
import { Cluster } from '../src/db/model/cluster';
import { Contact } from '../src/db/model/contact';
import { ProjectProfile } from '../src/db/model/profile';
import { UserProfile } from '../src/db/model/userprofile';

dotenv.config();

const host = 'registry.developer.gov.bc.ca';
// const host = 'registry-api-platform-registry-dev.apps.silver.devops.gov.bc.ca'
const axi = axios.create({
  baseURL: `https://${host}/api/v1`,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.KC_TOKEN}`,
  },
});
const params = {
  host: process.env.POSTGRESQL_HOST,
  port: 5432,
  database: process.env.APP_DB_NAME,
  user: process.env.APP_DB_USER,
  password: process.env.APP_DB_PASSWORD,
};

// enum Role {
//   ProductOwner = 1,
//   TechnicalContact,
// }

enum ClusterID {
  CLab = 1,
  KLab,
  Silver,
  Gold,
  GoldDR,
  Aro,
}

const main = async () => {
  const data = await fs.readFile('./scripts/capstone.json', 'utf8');
  const record = JSON.parse(data);
  const dm = new DataManager(new Pool(params));
  const { ProfileModel, ContactModel, NamespaceModel,
    ClusterModel, UserProfileModel } = dm;

  try {
    const owner: UserProfile = await UserProfileModel.findByKeycloakId(record.ownerId);
    const cluster: Cluster = await ClusterModel.findById(ClusterID.Silver);
    const profile: ProjectProfile = await ProfileModel.create({
      ...record.profile,
      primaryClusterName: cluster.name,
      userId: owner.id!,
    });

    for (const contact of record.contacts) {
      const c: Contact = await ContactModel.create(contact);
      await ProfileModel.addContactToProfile(profile.id!, c.id!);
    }

    await NamespaceModel.createProjectSet(profile.id!, ClusterID.Silver, profile.namespacePrefix);
    await axi.post(`provision/${profile.id!}/namespace`);
  } catch (err) {
    console.log(err);
  }
}

main();