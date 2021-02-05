//
// Copyright © 2020 Province of British Columbia
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

import { errorWithCode } from '@bcgov/common-nodejs-utils';
import { USER_ROLES } from '../constants';
import DataManager from '../db';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

export const getAuthorization = async(profileId: number, user: any, projectDetails?:any, projectContacts?:any): Promise<boolean | Error> => {
  const { ProfileModel, ContactModel } = dm;
  console.log('param details:', projectDetails)
  console.log('param details:', projectContacts)
  if (!projectDetails){
    projectDetails = await ProfileModel.findById(Number(profileId));
  }

  if (!projectContacts){
    projectContacts = await ContactModel.findForProject(Number(profileId));
  }
  console.log('post details:', projectDetails)
  console.log('post details:', projectContacts)

  const authorizedEmails = projectContacts.map(contact => contact.email);

  if (!(
    user.id === projectDetails.userId
    || authorizedEmails.includes(user.email)
    || user.roles.includes(USER_ROLES.ADMINISTRATOR)
  )) {
    return errorWithCode('Unauthorized Access', 401);
  }

  return true;
}