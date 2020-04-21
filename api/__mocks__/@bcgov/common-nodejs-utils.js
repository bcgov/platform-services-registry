//
// Code Sign
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
// Created by Jason Leach on 2018-09-28.
//

'use strict';

import * as ncu from '@bcgov/common-nodejs-utils';

// public certificate
const pem = `
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAs1adod1+laVtsql0olCs4zo/Ng4kJDdwHdzJQW6TlE61MlpskJPu
lK+OTytOdi/hSSnKPwNsMrzqm60RuR4hnhMJBdrOjbBnr6yUKSIAv6SPXK0QrmN5
Y0XuhV4kMkDJ0aN15UxRzSGdeaXAetmQEqSl/+lt33mTNsTfU6kzgKkwyZQSbITm
jze8MVVtjfdly0DsMt/1tc6l+tUvaDzGgqUEF5dAUFq2MgdH7FM6quHml3ze3F8z
Pmk6ia8tHZ4wJULOFiLvKuRNU8ZsPMuwyFPYtF+/b4HgVCco82EP51psNOXpq4YH
3qjAgJjYw3Oe1ULU+xdzXWXhzSq6WWxBAQIDAQAB
-----END RSA PUBLIC KEY-----`;

const token = {
  access_token: 'JOGYFQf/ADYI9oRjqaHqKdDO',
  expires_in: 1800,
  refresh_expires_in: 3600,
  refresh_token: 'vcCYB0V/qH7HA+QM0hBtutkq',
  token_type: 'bearer',
  'not-before-policy': 0,
  session_state: '5fa5d913-98bb-45fe-ae5f-b44c919c83e1',
};

/* eslint-disable-next-line no-unused-vars */
ncu.getJwtCertificate = ssoCertificateUrl =>
  Promise.resolve({
    certificate: pem,
    algorithm: 'RS256',
  });

class JWTServiceManager {
  static get accessToken() {
    return Promise.resolve(token.access_token);
  }
}

ncu.JWTServiceManager = JWTServiceManager;

module.exports = ncu;
