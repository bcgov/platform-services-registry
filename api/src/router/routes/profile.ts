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

'use strict';

import { asyncMiddleware } from '@bcgov/common-nodejs-utils';
import express from 'express';
import { archiveProfileNamespace, createNamespace, fetchProfileNamespace, fetchProfileNamespaces, updateProfileNamespace } from '../../controllers/namespace';
import { addContactToProfile, fetchProfileAllowedQuotaSizes, fetchProfileContacts, fetchProfileEditRequests, fetchProfileQuotaSize, updateProfileContacts, updateProfileQuotaSize } from '../../controllers/profile';
import { archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProjectProfile, updateProjectProfile } from '../../controllers/project-profile';
import { authorize } from '../../libs/authorization';

const router = express.Router();

// Profiles
router.post('/', asyncMiddleware(createProjectProfile));
router.get('/', asyncMiddleware(fetchAllProjectProfiles));
router.get('/:profileId', authorize(), asyncMiddleware(fetchProjectProfile));
router.delete('/:profileId', authorize(), asyncMiddleware(archiveProjectProfile));
// may involve provisioner-related changes
router.put('/:profileId', authorize(), asyncMiddleware(updateProjectProfile));


// Namespace
router.post('/:profileId/namespace', authorize(), asyncMiddleware(createNamespace));
router.get('/:profileId/namespace', authorize(), asyncMiddleware(fetchProfileNamespaces));
router.get('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(fetchProfileNamespace));
router.put('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(updateProfileNamespace));
router.delete('/:profileId/namespace/:namespaceId', authorize(), asyncMiddleware(archiveProfileNamespace));


// Contacts
router.get('/:profileId/contacts', authorize(), asyncMiddleware(fetchProfileContacts));
router.post('/:profileId/contact/:contactId', authorize(), asyncMiddleware(addContactToProfile));
// may involve provisioner-related changes
router.post('/:profileId/contacts', authorize(), asyncMiddleware(updateProfileContacts));


// Quota
router.get('/:profileId/quota-size', authorize(), asyncMiddleware(fetchProfileQuotaSize));
router.get('/:profileId/allowed-quota-sizes', authorize(), asyncMiddleware(fetchProfileAllowedQuotaSizes));
// will involve provisioner-related changes
router.post('/:profileId/quota-size', authorize(), asyncMiddleware(updateProfileQuotaSize));


// Request
router.get('/:profileId/request', authorize(), asyncMiddleware(fetchProfileEditRequests));

export default router;
