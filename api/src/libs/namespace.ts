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
import { Request, Response } from 'express';
import { difference } from 'lodash';
import config from '../config';
import DataManager from '../db';

export const createNamespace = async (req: Request, res: Response): Promise<void> => {
  const dm = new DataManager(config);
  const { NamespaceModel } = dm;
  const { profileId } = req.params;
  const { body } = req;
  const aBody = { ...body, profileId };

  const diff = difference(NamespaceModel.requiredFields, Object.keys(aBody));
  if (diff.length !== 0) {
    throw errorWithCode(`Missing required properties: ${diff}`, 400);
  }

  try {
    const results = await NamespaceModel.create(aBody);

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable create new namespace';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileNamespaces = async (req: Request, res: Response): Promise<void> => {
  const dm = new DataManager(config);
  const { NamespaceModel } = dm;
  const { profileId } = req.params;

  try {
    const results = await NamespaceModel.findForProfile(Number(profileId));

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable fetch namespace with ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileNamespace = async (req: Request, res: Response): Promise<void> => {
  const dm = new DataManager(config);
  const { NamespaceModel } = dm;
  const { profileId, namespaceId } = req.params;
  const { body } = req;

  // Make sure these are not updated!
  delete body.id;
  delete body.archived;
  delete body.createdAt;
  delete body.updatedAt;

  const aBody = { ...body, profileId };
  const diff = difference(NamespaceModel.requiredFields, Object.keys(aBody));
  if (diff.length !== 0) {
    throw errorWithCode(`Missing required properties: ${diff}`, 400);
  }

  try {
    const results = await NamespaceModel.update(namespaceId, aBody);

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable update project profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const archiveProfileNamespace = async (req: Request, res: Response): Promise<void> => {
  const dm = new DataManager(config);
  const { NamespaceModel } = dm;
  const { profileId, namespaceId } = req.params;

  try {
    await NamespaceModel.delete(namespaceId);

    res.status(204).end();
  } catch (err) {
    const message = `Unable to archive profile ${profileId} namespace ${namespaceId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
