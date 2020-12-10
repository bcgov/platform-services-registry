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
// Created by Jason Leach on 2020-04-27.
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import { RequestEditType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillNamespaceEdit } from '../libs/fulfillment';
import { getNamespaceSet, getNamespaceSetQuotaOptions, mergeRequestedCNToNamespaceSet, validateQuotaRequestBody } from '../libs/quota-editing';
import shared from '../libs/shared';
import { validateObjProps } from '../libs/utils';

const dm = new DataManager(shared.pgPool);

export const createNamespace = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { NamespaceModel } = dm;
  const { profileId } = params;
  const aBody = { ...body, profileId };

  const rv = validateObjProps(NamespaceModel.requiredFields, aBody);
  if (rv) {
    throw rv;
  }

  try {
    const results = await NamespaceModel.create(aBody);

    res.status(201).json(results);
  } catch (err) {
    const message = 'Unable create new namespace';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileNamespaces = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { NamespaceModel } = dm;
  const { profileId } = params;

  try {
    const results = await NamespaceModel.findForProfile(Number(profileId));

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable fetch namespace for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileNamespace = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { NamespaceModel } = dm;
  const { namespaceId } = params;

  try {
    const results = await NamespaceModel.findById(Number(namespaceId));

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable fetch namespace with ID ${namespaceId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileNamespace = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { NamespaceModel } = dm;
  const { profileId, namespaceId } = params;
  const { name, clusterId } = body;
  const aBody = { name, profileId, clusterId };

  const rv = validateObjProps(NamespaceModel.requiredFields, aBody);
  if (rv) {
    throw rv;
  }

  try {
    await NamespaceModel.update(namespaceId, aBody);

    res.status(204).end();
  } catch (err) {
    const message = `Unable update project profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const archiveProfileNamespace = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { NamespaceModel } = dm;
  const { profileId, namespaceId } = params;

  try {
    await NamespaceModel.delete(namespaceId);

    res.status(204).end();
  } catch (err) {
    const message = `Unable to archive profile ${profileId} namespace ${namespaceId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileQuotaOptions = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  try {
    // process request params to get namespaces
    const { profileId, clusterName } = params;
    const namespaces = await getNamespaceSet(profileId, user);
    if (!namespaces) {
      const errmsg = `Cant fetch namespaces for user ${user.id}`;
      throw new Error(errmsg);
    }

    // fetch quota options for namespaces with an optional cluster name
    const quotaOptions = await getNamespaceSetQuotaOptions(namespaces, clusterName);
    res.status(200).json(quotaOptions);
  } catch (err) {
    const message = `Unable to fetch quota options`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};

export const requestProfileQuotaEdit = async (
  { params, user, body }: { params: any, user: AuthenticatedUser, body: any }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  try {
    // process request params to get namespaces
    const { profileId, clusterName } = params;
    const namespaces = await getNamespaceSet(profileId, user);
    if (!namespaces) {
      const errmsg = `Cant fetch namespaces for user ${user.id}`;
      throw new Error(errmsg);
    }

    // process request body for validation
    const quotaOptions = await getNamespaceSetQuotaOptions(namespaces, clusterName);
    if (!quotaOptions) {
      const errmsg = `Cant fetch quota options for user ${user.id}`;
      throw new Error(errmsg);
    }
    const rv = validateQuotaRequestBody(quotaOptions, body);
    if (rv) {
      throw rv;
    }

    // create a request record and send nats message
    const editObject = await mergeRequestedCNToNamespaceSet(body, namespaces, clusterName);
    if (!editObject) {
      const errmsg = 'Cant generate request edit object';
      throw new Error(errmsg);
    }
    const editType = RequestEditType.Namespaces;

    const { natsContext, natsSubject } = await fulfillNamespaceEdit(profileId, editType, editObject);
    await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(editObject),
      natsSubject,
      natsContext: JSON.stringify(natsContext),
    })
    res.status(204).end();
  } catch (err) {
    const message = `Unable to update quota`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};
