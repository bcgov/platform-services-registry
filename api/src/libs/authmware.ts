//
// SecureImage
//
// Copyright © 2018 Province of British Columbia
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
// Created by Jason Leach on 2018-02-14.
//

/* eslint-env es6 */

'use strict';

import { getJwtCertificate, logger } from '@bcgov/common-nodejs-utils';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '../config';
import { WEB_CLIENT_ID } from '../constants';
import DataManager from '../db';
import shared from './shared';

export interface AuthenticatedUser {
  id: number;
  givenName: string;
  familyName: string;
  name: string;
  preferredUsername: string;
  email: string;
  archived: boolean;
  roles: string[];
  lastSeenAt: object,
}

export const isAuthorized = jwtPayload => {
  return true;
};

export const getJwtPayloadRoles = (jwtPayload: object): string[] | [] => {
  try {
    /* tslint:disable-next-line */
    return jwtPayload['resource_access'][WEB_CLIENT_ID]['roles'];
  } catch (err) {
    return [];
  }
};

export const verify = async (req, jwtPayload, done) => {

  if (jwtPayload) {
    if (!isAuthorized(jwtPayload)) {
      // tslint:disable-next-line:no-shadowed-variable
      const err = new Error('You do not have the proper role for signing');
      // err.code = 401;

      return done(err, null);
    }

    try {
      let userProfile;
      const dm = new DataManager(shared.pgPool);
      const { UserProfileModel } = dm;

      userProfile = await UserProfileModel.findByKeycloakId(jwtPayload.sub);
      if (!userProfile) {
        // create one
        userProfile = await UserProfileModel.create({
          keycloakId: jwtPayload.sub,
        });
      }

      const user = {
        roles: getJwtPayloadRoles(jwtPayload),
        name: jwtPayload.name,
        preferredUsername: jwtPayload.preferred_username,
        givenName: jwtPayload.given_name,
        familyName: jwtPayload.family_name,
        email: jwtPayload.email,
      };

      const profile: AuthenticatedUser = { ...userProfile, ...user };

      // The returned user will be made available via `req.user`
      return done(null, profile); // OK
    } catch (err) {
      const message = 'JWT verification error';
      logger.error(`${message}, err = ${err.message}`);
      return done(null, null); // FAIL
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  const err = new Error('Unable to authenticate');
  // err.code = 401;

  return done(err, false);
};

export const authmware = async app => {
  // app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // We don't store any user information.
  passport.serializeUser((user, done) => {
    logger.info('serialize');
    done(null, {});
  });

  // We don't load any addtional user information.
  passport.deserializeUser((id, done) => {
    logger.info('deserialize');
    done(null, {});
  });

  const { certificate, algorithm } = await getJwtCertificate(config.get('sso:certsUrl'));
  const opts: any = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.algorithms = [algorithm];
  opts.secretOrKey = certificate;
  opts.passReqToCallback = true;
  // For development purposes only ignore the expiration
  // time of tokens.
  if (config.get('environment') === 'development') {
    opts.ignoreExpiration = true;
  }

  const jwtStrategy = new JwtStrategy(opts, verify);

  passport.use(jwtStrategy);
};
