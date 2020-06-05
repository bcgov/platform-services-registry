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
// Created by Jason Leach on 2018-10-02.
//

// @ts-ignore
import { ImplicitAuthManager } from '@bcgov/common-web-utils';

export interface Authentication {
  isAuthenticated: boolean;
}

const config = {
  baseURL:
    process.env.NODE_ENV === 'production'
      ? '{{.Env.SSO_BASE_URL}}'
      : 'https://sso-dev.pathfinder.gov.bc.ca',
  realmName: 'devhub',
  clientId: 'signing-web',
  kcIDPHint: '', // Skip SSO, go directly to IDIR auth.
};

const iam = new ImplicitAuthManager(config);

export default iam;
