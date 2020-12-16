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
import { Contact } from '../db/model/contact';
import { Request, RequestEditType } from '../db/model/request';
import { fulfillNamespaceEdit } from '../libs/fulfillment';
import shared from '../libs/shared';
import { formatNatsContactObject, validateObjProps } from '../libs/utils';

const dm = new DataManager(shared.pgPool);
const { ContactModel, RequestModel } = dm;
const whichService = 'contact editing';

export const createContact = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {

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
    // process request params to get profileId and define RequestEditType
    const { profileId } = params;
    const { productOwner, technicalContact } = body;
    const editType = RequestEditType.Contacts;

    const contacts = [productOwner, technicalContact]

    // process request body for natsContext
    const editObject = await formatNatsContactObject(body)
    if (!editObject) {
      const errmsg = 'Cant generate request edit object';
      throw new Error(errmsg);
    }

    const { natsContext, natsSubject } = await fulfillNamespaceEdit(profileId, editType, editObject);

    // create Request record for contact edit
    await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(contacts),
      natsSubject,
      natsContext: JSON.stringify(natsContext),
    })
    res.status(204).end();
  } catch (err) {
    const message = `Unable to update contact`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};

export const processContactEdit = async (request: Request): Promise<void> => {
  try {
    const { editObject } = request;
    const contacts = JSON.parse(editObject);
    const updatePromises: any = [];
    contacts.forEach((contact: Contact) => {
      updatePromises.push(ContactModel.update(Number(contact.id), contact))
    })

    await Promise.all(updatePromises);
    return;
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    throw err;
  }
};
