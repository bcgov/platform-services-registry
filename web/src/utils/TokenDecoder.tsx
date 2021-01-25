//
// Copyright © 2020 Province of British Columbia
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

import jwt_decode from 'jwt-decode';

interface UserProperties {
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  preferred_username: string;
}

export default function getDecodedToken(token: string) {
  const decodedJWT = jwt_decode<UserProperties>(token);
  return decodedJWT;
}
