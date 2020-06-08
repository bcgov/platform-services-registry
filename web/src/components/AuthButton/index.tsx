//
// DevHub
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
// Created by Jason Leach on 2018-10-03.
//

import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';

const StyledButton = styled.button`
  position: relative;
  margin-left: auto;
  padding: 8px 16px;
  border: none;
  background-color: #fcba19;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 2px;
  outline-width: 0;
  text-decoration: none;
  overflow: hidden;
  cursor: pointer;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
`
const titleForAuthenticationState = (keycloak: any): string => {
  if (keycloak.authenticated) {
    return 'Logout';
  }

  return 'Login';
};

const actionForCurrentState = (keycloak: any): any => {
  if (keycloak.authenticated) {
    return () => keycloak.logout();
  }

  return () => keycloak.login();
};

export default () => {

  const { keycloak } = useKeycloak()

  return (
    <span>
      <StyledButton
        className="auth-button"
        onClick={actionForCurrentState(keycloak)}
      >
        {titleForAuthenticationState(keycloak)}
      </StyledButton>
    </span>
  );
};
