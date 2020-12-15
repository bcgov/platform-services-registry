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
// Created by Jason Leach on 2020-04-21.
//

'use strict';

import { asyncMiddleware } from '@bcgov/common-nodejs-utils';
import express from 'express';
import { requestContactEdit } from '../../controllers/contact';
import { archiveProfileNamespace, createNamespace, fetchProfileNamespace, fetchProfileNamespaces, fetchProfileQuotaOptions, requestProfileQuotaEdit, updateProfileNamespace } from '../../controllers/namespace';
import { addContactToProfile, archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProfileContacts, fetchProfileEditRequests, fetchProjectProfile, updateProjectProfile } from '../../controllers/profile';

const router = express.Router();

// Profiles
router.post('/', asyncMiddleware(createProjectProfile));
router.get('/', asyncMiddleware(fetchAllProjectProfiles));
router.get('/:profileId', asyncMiddleware(fetchProjectProfile));
router.put('/:profileId', asyncMiddleware(updateProjectProfile));
router.delete('/:profileId', asyncMiddleware(archiveProjectProfile));

// Namespace
router.post('/:profileId/namespace', asyncMiddleware(createNamespace));
router.get('/:profileId/namespace', asyncMiddleware(fetchProfileNamespaces));
router.get('/:profileId/namespace/:namespaceId', asyncMiddleware(fetchProfileNamespace));
router.put('/:profileId/namespace/:namespaceId', asyncMiddleware(updateProfileNamespace));
router.delete('/:profileId/namespace/:namespaceId', asyncMiddleware(archiveProfileNamespace));

// Contacts
router.get('/:profileId/contacts', asyncMiddleware(fetchProfileContacts));
router.post('/:profileId/contact/:contactId', asyncMiddleware(addContactToProfile));
router.post('/:profileId/contact-edit', asyncMiddleware(requestContactEdit));

// Quota-edit
router.get('/:profileId/quota-edit', asyncMiddleware(fetchProfileQuotaOptions));
router.post('/:profileId/quota-edit', asyncMiddleware(requestProfileQuotaEdit));

// Profile / Contact Edit
router.get('/:profileId/request', asyncMiddleware(fetchProfileEditRequests));

export default router;
