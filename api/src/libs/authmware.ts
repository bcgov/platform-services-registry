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

/* eslint-env es6 */

import { getJwtCertificate, logger } from "@bcgov/common-nodejs-utils";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import config from "../config";
import DataManager from "../db";
import { assignUserAccessFlags } from "./authorization";
import shared from "./shared";

export interface AuthenticatedUser {
  id: number;
  givenName: string;
  familyName: string;
  name: string;
  preferredUsername: string;
  email: string;
  archived: boolean;
  accessFlags: string[];
  lastSeenAt: object;
}

export const verify = async (req, jwtPayload, done) => {
  if (jwtPayload) {
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
        accessFlags: assignUserAccessFlags(jwtPayload),
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
      const message = "JWT verification error";
      logger.error(`${message}, err = ${err.message}`);
      return done(null, null); // FAIL
    }
  }

  // tslint:disable-next-line:no-shadowed-variable
  const err = new Error("Unable to authenticate");
  // err.code = 401;

  return done(err, false);
};

export const authmware = async (app) => {
  // app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // We don't store any user information.
  passport.serializeUser((user, done) => {
    logger.info("serialize");
    done(null, {});
  });

  // We don't load any addtional user information.
  passport.deserializeUser((id, done) => {
    logger.info("deserialize");
    done(null, {});
  });

  const { certificate, algorithm } = await getJwtCertificate(
    config.get("sso:certsUrl")
  );
  const opts: any = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.algorithms = [algorithm];
  opts.secretOrKey = certificate;
  opts.passReqToCallback = true;
  // For development purposes only ignore the expiration
  // time of tokens.
  if (config.get("environment") === "development") {
    opts.ignoreExpiration = true;
  }

  const jwtStrategy = new JwtStrategy(opts, verify);

  passport.use(jwtStrategy);
};
