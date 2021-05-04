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
import { fetchQuota, fetchQuotaSizes } from '../../controllers/quota';

const router = express.Router();

// Quota
// Fetches raw quota specifications from DB
// This endpoint is not being utilized by the front end; implemented for future use
router.get('/', asyncMiddleware(fetchQuota));

// Utilizes raw data from DB
// and transfroms to usable data for the front end
router.get('/sizes', asyncMiddleware(fetchQuotaSizes));

export default router;
