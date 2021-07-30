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
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import {  Response } from 'express';
import DataManager from '../db';
import shared from '../libs/shared';
import { validateRequiredFields } from '../libs/utils';
import { getUserByName, inviteUserToOrgs } from '../libs/github'


const dm = new DataManager(shared.pgPool);
const { ContactModel } = dm;

export const createContact = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {

  const rv = validateRequiredFields(ContactModel.requiredFields, body);
  if (rv) {
    throw rv;
  }

  try {
    const result = await ContactModel.create(body);

    res.status(201).json(result);
  } catch (err) {
    const message = `Unable to create contact`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

/**
 * POST /requests
 * @param {Express Request} req
 * @param {Express Response} res
 * @returns undefined
 */
 export const inviteToOrg   = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  logger.info('createInvitationRequest')

  const {   user: recipient, organizations } = body
  // const { user: requester } = req.auth


console.log('================================', organizations)
  try {
    logger.info(`user  approved request created for ${recipient}`)
    const { id } = await getUserByName(recipient)

    const promises = await inviteUserToOrgs(
      id,
      organizations,
      recipient
      )
      
      await Promise.all(promises)

    // this is where we could create the invitations for recipient

    res.status(201).send({
      message: `${organizations.length} approved invitation${
        organizations.length > 1 ? 's' : ''
      } created`,
    })
    logger.info('user created invitationRequest')
   
  } catch (e) {
    logger.warn(`user request failed`)
    logger.error(e.message)
    res.status(500).send({
      message: 'Unable to create invitation',
    })
  }
  
  }