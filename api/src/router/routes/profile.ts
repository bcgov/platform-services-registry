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
import { archiveProfileNamespace, createNamespace, fetchProfileNamespace, fetchProfileNamespaces, updateProfileNamespace } from '../../controllers/namespace';
import { addContactToProfile, fetchProfileContacts, fetchProfileEditRequests, fetchProfileQuotaOptions, fetchProfileQuotaSize, requestProfileContactsEdit, requestProfileQuotaEdit, requestProjectProfileEdit } from '../../controllers/profile';
import { archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProjectProfile, updateProjectProfile } from '../../controllers/project-profile';
import { authorize } from '../../libs/authorization';

const router = express.Router();

// Profiles
router.post('/', asyncMiddleware(createProjectProfile));
router.get('/', asyncMiddleware(fetchAllProjectProfiles));
router.get('/:profileId', authorize(), asyncMiddleware(fetchProjectProfile));
router.put('/:profileId', authorize(), asyncMiddleware(updateProjectProfile));
router.delete('/:profileId', authorize(), asyncMiddleware(archiveProjectProfile));

// Namespace
router.post('/:profileId/namespace', authorize(), asyncMiddleware(createNamespace));
router.get('/:profileId/namespace', authorize(), asyncMiddleware(fetchProfileNamespaces));
router.get('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(fetchProfileNamespace));
router.put('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(updateProfileNamespace));
router.delete('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(archiveProfileNamespace));

// Contacts
router.get('/:profileId/contacts', authorize(), asyncMiddleware(fetchProfileContacts));
router.post('/:profileId/contact/:contactId', authorize(), asyncMiddleware(addContactToProfile));

// Quota
router.get('/:profileId/quota-size', authorize(), asyncMiddleware(fetchProfileQuotaSize));

// Edit
router.get('/:profileId/request', authorize(), asyncMiddleware(fetchProfileEditRequests));
router.post('/:profileId/profile-edit', authorize(), asyncMiddleware(requestProjectProfileEdit));
router.post('/:profileId/contact-edit', authorize(), asyncMiddleware(requestProfileContactsEdit));
router.get('/:profileId/quota-edit', authorize(), asyncMiddleware(fetchProfileQuotaOptions));
router.post('/:profileId/quota-edit', authorize(), asyncMiddleware(requestProfileQuotaEdit))

export default router;
