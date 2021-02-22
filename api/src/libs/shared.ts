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
import { default as CommonEmailService, Options } from '../libs/service';

interface Shared {
  pgPool: Pool;
  nats: any;
  ches: CommonEmailService;
}


const ssoKey = Symbol.for('ca.bc.gov.platsrv.sso');
const pgPoolKey = Symbol.for('ca.bc.gov.platsrv.pgpool');
const natsKey = Symbol.for('ca.bc.gov.platsrv.nats');
const chesKey = Symbol.for('ca.bc.gov.platsrv.CHES');

const gs = Object.getOwnPropertySymbols(global);

const main = async () => {

  if (gs.indexOf(chesKey) <= -1) {
    const opts: Options = {
      uri: config.get('ches:ssoTokenURL'),
      grantType: config.get('ches:ssoGrantType'),
      clientId: config.get('ches:ssoClientId'),
      clientSecret: config.get('ches:ssoClientSecret'),
      baseURL: config.get('ches:baseURL'),
    };

    const ches = new CommonEmailService(opts)
    global[chesKey] = ches;
  }

  if (gs.indexOf(natsKey) <= -1) {
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

  if (gs.indexOf(ssoKey) <= -1) {
    const params = {
      uri: config.get('sso:tokenUrl'),
      grantType: config.get('sso:grantType'),
      clientId: config.get('sso:clientId'),
      clientSecret: config.get('sso:clientSecret'),
    };

    global[ssoKey] = new JWTServiceManager(params);
  }

  if (gs.indexOf(pgPoolKey) <= -1) {
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

Object.defineProperty(shared, 'ches', {
  get: () => global[chesKey],
});

Object.freeze(shared);

export default shared as Shared;
