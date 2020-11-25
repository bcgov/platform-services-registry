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
import { ClusterNamespace, ProjectNamespace } from '../db/model/namespace';
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillNamespaceQuotaEdit } from '../libs/fulfillment';
import shared from '../libs/shared';
import { getQuotaOptions, isNotAuthorized, MergeQuotasIntoNamespaces, validateObjProps, validateQuotaRequestBody } from '../libs/utils';
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

const getNamespacesForQuotaEdit = async (params: any, user: AuthenticatedUser): Promise<ProjectNamespace[]> =>
  new Promise(async (resolve, reject) => {
    const { NamespaceModel, ProfileModel } = dm;
    const { profileId } = params;

    // TODO:(yf) add further data sanity check
    const rv = validateObjProps(['profileId'], { profileId });
    if (rv) {
      reject(rv);
    }

    try {
      // user auth check
      const record = await ProfileModel.findById(Number(profileId));
      const notAuthorized = isNotAuthorized(record, user);
      if (notAuthorized) {
        reject(notAuthorized);
      }

      const namespaces = await NamespaceModel.findForProfile(Number(profileId));

      resolve(namespaces);
    } catch (err) {
      const message = `Unable to process namespaces for quota request`;
      logger.error(`${message}, err = ${err.message}`);
      throw err;
    }
  });

const getClusterNamespacesForQuotaEdit = async (
  namespacesForQuotaEdit: ProjectNamespace[]): Promise<ClusterNamespace[]> =>
  new Promise(async (resolve, reject) => {
    const { NamespaceModel, ClusterModel } = dm;

    try {
      // TODO:(yf) DRY the code below by putting it into a method
      const clusters = await ClusterModel.findAll();
      const clusterId = clusters.filter(c => c.isDefault === true).pop().id;

      const promises: Promise<ClusterNamespace>[] = [];
      namespacesForQuotaEdit.forEach(namespace => {
        // @ts-ignore
        promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, clusterId));
      });

      const clusterNamespaces = await Promise.all(promises);

      resolve(clusterNamespaces);
    } catch (err) {
      const message = `Unable to process cluster namespaces for quota request`;
      logger.error(`${message}, err = ${err.message}`);
      throw err;
    }
  });

export const fetchProfileQuotaOptions = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  try {
    const namespaces = await getNamespacesForQuotaEdit(params, user);
    const clusterNamespaces = await getClusterNamespacesForQuotaEdit(namespaces);

    const promises: Promise<ClusterNamespace>[] = [];
    clusterNamespaces.forEach(cn => {
      promises.push(getQuotaOptions(cn));
    });

    const quotaOptions = await Promise.all(promises);

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
  try {
    const namespaces = await getNamespacesForQuotaEdit(params, user);
    const clusterNamespaces = await getClusterNamespacesForQuotaEdit(namespaces);

    const promises: Promise<ClusterNamespace>[] = [];
    clusterNamespaces.forEach(cn => {
      promises.push(getQuotaOptions(cn));
    });

    const quotaOptions = await Promise.all(promises);

    const rv = validateQuotaRequestBody(quotaOptions, body);
    if (rv) {
      throw rv;
    }

    // TODO:(yf) add logics here so if the body[i] is exactly the same as current quotas
    // we save a trip to calling bot

    const requestJson = MergeQuotasIntoNamespaces(body, namespaces)
    // send request nats message to bot
    await fulfillNamespaceQuotaEdit(requestJson);
    res.status(204).end();
  } catch (err) {
    const message = `Unable to update profile namespace quota`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};
