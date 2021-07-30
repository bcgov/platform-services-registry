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

// import cluster from 'cluster';
import { logger } from '@bcgov/common-nodejs-utils';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { authmware } from './libs/authmware';
import { router } from './router';
import init from './libs/githubInvitationInit';

// Config

const app = express();
const options = {
  inflate: true,
  limit: '204800kb', // 200Mb
  type: 'image/*',
};
const docpath = path.join(__dirname, '../', 'public/doc/api');
const pubpath = path.join(__dirname, '../', 'public');

fs.access(docpath, fs.constants.R_OK, err => {
  if (err) {
    logger.warn('API documentation does not exist');
    return;
  }

  app.use('/doc', express.static(docpath));
});

fs.access(pubpath, fs.constants.R_OK, err => {
  if (err) {
    logger.warn('Static assets location does not exist');
    return;
  }

  app.use('/', express.static(pubpath));
});

app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.raw(options));
app.use(flash());
// app.use('/download', express.static('download'));

// Authentication middleware
authmware(app);


const initGithubApp =  () => {
  try {
    logger.info(`Initializing Github App`)
     init()
  } catch (e) {
    console.error('opps an error ocur while initialization github app',e)
    logger.info('Failed to initialize, exiting')
    process.exit(1)
  }
}
// Initializing Github App
initGithubApp()

// Server API routes
router(app);

// Error handleing middleware. This needs to be last in or it will
// not get called.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message);
  const code = err.code ? err.code : 500;
  const message = err.message ? err.message : 'Internal Server Error';

  res.status(code).json({ error: message, success: false });
});

export default app;
