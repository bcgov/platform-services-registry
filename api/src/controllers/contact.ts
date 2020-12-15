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
// Created by Jason Leach on 2020-06-15.
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import shared from '../libs/shared';
import { validateObjProps } from '../libs/utils';

const dm = new DataManager(shared.pgPool);

export const createContact = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { ContactModel } = dm;

  const rv = validateObjProps(ContactModel.requiredFields, body);
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

export const updateContact = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { ContactModel } = dm;
  const { contactId } = params;
  const {
    firstName,
    lastName,
    email,
    githubId,
  } = body;

  try {
    const record = await ContactModel.findById(contactId);
    const aBody = {
      userId: record.userId,
      firstName,
      lastName,
      email,
      githubId,
      roleId: record.roleId,
    };

    const rv = validateObjProps(ContactModel.requiredFields, aBody);

    if (rv) {
      throw rv;
    }

    const results = await ContactModel.update(contactId, aBody);

    res.status(200).json(results);
  } catch (err) {
    if (err.code) {
      throw err
    }

    const message = `Unable update contact ID ${contactId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const requestContactEdit = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  try {
    res.status(201).end();
  } catch (err) {
    const message = `Unable to update quota`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};
