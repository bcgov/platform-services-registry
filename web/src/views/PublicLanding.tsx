//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import queryString from 'querystring';
import React from 'react';
import { useLocation } from 'react-router';
import { Redirect } from 'react-router-dom';

const useQuery = () => {
  const location = useLocation();
  return queryString.parse(location.search.replace('?', '')) as any;
};

const Panel = styled.div`
  margin-top: 80px;
`;

export const PublicLanding = () => {
  const { keycloak } = useKeycloak();
  const { redirect } = useQuery();

  if (!keycloak) {
    return null;
  }

  if (keycloak?.authenticated) {
    return <Redirect to={redirect || '/namespaces'} />;
  }

  return (
    <Panel>
      <h1>Welcome</h1>
      <h4>Please log in to proceed</h4>
    </Panel>
  );
};