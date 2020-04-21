//
// Code Sign
//
// Copyright © 2018 Province of British Columbia
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
// Created by Jason Leach on 2018-07-23.
//

'use strict';

import { JWTServiceManager } from '@bcgov/common-nodejs-utils';
import * as minio from 'minio';
import config from '../config';

const mkey = Symbol.for('ca.bc.gov.pathfinder.signing-api.minio');
const skey = Symbol.for('ca.bc.gov.pathfinder.signing-api.sso');
const gs = Object.getOwnPropertySymbols(global);

if (!(gs.indexOf(mkey) > -1)) {
  global[mkey] = new minio.Client({
    endPoint: config.get('minio:host'),
    port: config.get('minio:port'),
    useSSL: config.get('minio:useSSL'),
    accessKey: config.get('minio:accessKey'),
    secretKey: config.get('minio:secretKey'),
    region: config.get('minio:region'),
  });
}

if (!(gs.indexOf(skey) > -1)) {
  global[skey] = new JWTServiceManager({
    uri: config.get('sso:tokenUrl'),
    grantType: config.get('sso:grantType'),
    clientId: config.get('sso:clientId'),
    clientSecret: config.get('sso:clientSecret'),
  });
}

const singleton = {};

Object.defineProperty(singleton, 'minio', {
  get: () => global[mkey],
});

Object.defineProperty(singleton, 'sso', {
  get: () => global[skey],
});

Object.freeze(singleton);

export default singleton;
