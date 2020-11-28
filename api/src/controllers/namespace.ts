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
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillNamespaceEdit, RequestEditType } from '../libs/fulfillment';
import { getClusterNamespaces, getCNQuotaOptions, getNamespaceSet, isQuotaRequestBodyValid, mergeRequestedCNToNamespaceSet, QuotaOptionsObject } from '../libs/quota-editing';
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

// TODO:(yf) catch specific err in order to serve specific status code
export const fetchProfileQuotaOptions = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  try {
    const namespaces = await getNamespaceSet(params, user);
    if (!namespaces) {
      throw new Error('Cant fetch namespaces for this profile');
    }

    const clusterNamespaces = await getClusterNamespaces(namespaces);
    if (!clusterNamespaces) {
      throw new Error('Cant fetch clusterNamespaces for this profile');
    }

    const promises: Promise<QuotaOptionsObject>[] = [];
    clusterNamespaces.forEach(cn => promises.push(getCNQuotaOptions(cn)));
    const quotaOptions = await Promise.all(promises);

    res.status(200).json(quotaOptions);
  } catch (err) {
    const message = `Unable to fetch quota options`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};

// TODO:(yf) catch specific err in order to serve specific status code
export const requestProfileQuotaEdit = async (
  { params, user, body }: { params: any, user: AuthenticatedUser, body: any }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  try {
    const { profileId } = params;

    const namespaces = await getNamespaceSet(params, user);
    if (!namespaces) {
      throw new Error('Cant get namespaceSet');
    }

    const clusterNamespaces = await getClusterNamespaces(namespaces);
    if (!clusterNamespaces) {
      throw new Error('Cant get clusterNamespaces');
    }

    const promises: Promise<QuotaOptionsObject>[] = [];
    clusterNamespaces.forEach(cn => promises.push(getCNQuotaOptions(cn)));
    const quotaOptions = await Promise.all(promises);

    const rv = isQuotaRequestBodyValid(quotaOptions, body);
    if (rv) {
      throw rv;
    }

    // TODO:(yf) add logics here so if the body is exactly the same
    // as current quotas, we save a trip to calling bot
    const editType = RequestEditType.Namespaces;
    const editObject = mergeRequestedCNToNamespaceSet(body, namespaces);
    if (!editObject) {
      throw new Error('Cant generate request edit object');
    }
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
