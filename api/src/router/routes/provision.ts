//
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
// Created by Jason Leach on 2020-06-15.
//

'use strict';

import { asyncMiddleware } from '@bcgov/common-nodejs-utils';
import express from 'express';
import { provisionCallbackHandler, provisionProfileNamespaces } from '../../controllers/provision';
import { getAllProfileIdsUnderPending, getAllProvisionedProfileIds, getProfileBotJsonUnderPending, getProvisionedProfileBotJson } from '../../controllers/sync';

const router = express.Router();

// Provisioning
router.post('/:profileId/namespace', asyncMiddleware(provisionProfileNamespaces));
router.put('/namespace', asyncMiddleware(provisionCallbackHandler));

// Bot-json-sync
router.get('/sync/provisioned-profile-ids', asyncMiddleware(getAllProvisionedProfileIds));
router.get('/sync/:profileId/provisioned-profile-bot-json', asyncMiddleware(getProvisionedProfileBotJson));
router.get('/sync/under-pending-profile-ids', asyncMiddleware(getAllProfileIdsUnderPending));
router.get('/sync/:profileId/under-pending-profile-bot-json', asyncMiddleware(getProfileBotJsonUnderPending));
export default router;
