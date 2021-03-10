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
// Created by Jason Leach on 2020-04-28.
//

import { Pool } from 'pg';
import BotMessageModel from './model/bot-message';
import ClusterModel from './model/cluster';
import ContactModel from './model/contact';
import MinistryModel from './model/ministry';
import NamespaceModel from './model/namespace';
import ProfileModel from './model/profile';
import QuotaModel from './model/quota';
import RequestModel from './model/request';
import UserProfileModel from './model/userprofile';

export default class DataManager {
  pool: Pool;
  ProfileModel: ProfileModel;
  NamespaceModel: NamespaceModel;
  ContactModel: ContactModel;
  UserProfileModel: UserProfileModel;
  ClusterModel: ClusterModel;
  MinistryModel: MinistryModel;
  RequestModel: RequestModel;
  QuotaModel: QuotaModel;
  BotMessageModel: BotMessageModel

  constructor(pool: Pool) {
    this.pool = pool;
    this.ProfileModel = new ProfileModel(pool);
    this.NamespaceModel = new NamespaceModel(pool);
    this.ContactModel = new ContactModel(pool);
    this.UserProfileModel = new UserProfileModel(pool);
    this.ClusterModel = new ClusterModel(pool);
    this.MinistryModel = new MinistryModel(pool);
    this.RequestModel = new RequestModel(pool);
    this.QuotaModel = new QuotaModel(pool);
    this.BotMessageModel = new BotMessageModel(pool);
  }
}
