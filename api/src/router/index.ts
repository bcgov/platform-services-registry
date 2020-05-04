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

import cors from 'cors';
import config from '../config';
import ehlo from './routes/ehlo';
import profile from './routes/profile';

const corsOptions = {
  origin: config.get('environment') === 'development' ? '*' : config.get('apiUrl'),
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// eslint-disable-next-line import/prefer-default-export
export const router = app => {
  app.use(cors(corsOptions));
  app.use('/api/v1/ehlo', ehlo); // probes
  // Any routes following the authentication middleware line below
  // will require authentication.
  // app.use(passport.authenticate('jwt', { session: false }));
  app.use('/api/v1/profile', profile);
};
