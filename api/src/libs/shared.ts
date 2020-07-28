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

import { JWTServiceManager, logger } from '@bcgov/common-nodejs-utils';
import nats from 'nats';
import { Pool } from 'pg';
import config from '../config';

interface Shared {
  pgPool: Pool;
  nats: any;
}

const ssoKey = Symbol.for('ca.bc.gov.platsrv.sso');
const pgPoolKey = Symbol.for('ca.bc.gov.platsrv.pgpool');
const natsKey = Symbol.for('ca.probateapp.nats');
const gs = Object.getOwnPropertySymbols(global);

const main = async () => {

  if (!(gs.indexOf(natsKey) > -1)) {
    const host = `${config.get('nats:host')}:${config.get('nats:port')}`;
    const nc = nats.connect({
      json: true,
      servers: [host],
    });

    nc.on('reconnecting', () => {
      logger.info('nats reconnecting');
    });

    nc.on('reconnect', conn => {
      logger.info(`nats reconnect to ${conn.currentServer.url.host}`);
    });

    nc.on('connect', conn => {
      logger.info(`nats connect to ${conn.currentServer.url.host}`);
    });

    global[natsKey] = nc;
  }

  if (!(gs.indexOf(ssoKey) > -1)) {
    global[ssoKey] = new JWTServiceManager({
      uri: config.get('sso:tokenUrl'),
      grantType: config.get('sso:grantType'),
      clientId: config.get('sso:clientId'),
      clientSecret: config.get('sso:clientSecret'),
    });
  }

  if (!(gs.indexOf(pgPoolKey) > -1)) {
    const params = {
      host: config.get('db:host'),
      port: config.get('db:port'),
      database: config.get('db:database'),
      user: config.get('db:user'),
      password: config.get('db:password'),
      max: config.get('db:maxConnections'),
      idleTimeoutMillis: config.get('db:idleTimeout'),
      connectionTimeoutMillis: config.get('db:connectionTimeout'),
    }

    console.log(params);
    global[pgPoolKey] = new Pool(params);
  }
}

main();

const shared = {};

Object.defineProperty(shared, 'sso', {
  get: () => global[ssoKey],
});

Object.defineProperty(shared, 'pgPool', {
  get: () => global[pgPoolKey],
});

Object.defineProperty(shared, 'nats', {
  get: () => global[natsKey],
});

Object.freeze(shared);

export default shared as Shared;
