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
// Created by Jason Leach on 2020-06-05.
//

export const SSO_BASE_URL = process.env.NODE_ENV === 'production'
  ? '{{env "SSO_BASE_URL"}}'
  : 'https://sso-dev.pathfinder.gov.bc.ca';
export const SSO_CLIENT_ID = 'registry-web';
export const SSO_REALM_NAME = 'devhub';

export const API = {
  BASE_URL: () =>
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8100/api/v1/'
      : `${window.location.origin}/api/v1/`,
};

export const ROLES = {
  PRODUCTOWNER: 1,
  TECHNICAL: 2,
};

export const DEFAULT_MINISTRY = 'CITZ';

export const DROPDOWN_CLASSNAME = 'misc-class-m-show-dropdown';
