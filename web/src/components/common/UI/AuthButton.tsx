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

import styled from '@emotion/styled';
import { useKeycloak } from '@react-keycloak/web';
import React from 'react';

export interface IButtonProps {
  children?: React.ReactNode;
  onClick?: (e: any) => void;
}

export const StyledButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: #fcba19;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 2px;
  cursor: pointer;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
`;

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

  // TODO: update this once a better access control is in place
  // where we check if users are part of our GitHub organization
  return () => keycloak.login({ idpHint: 'idir' });
};

const Button: React.SFC<IButtonProps> = (props) => {
  const { keycloak } = useKeycloak();

  return (
    <StyledButton onClick={actionForCurrentState(keycloak)}>
      {titleForAuthenticationState(keycloak)}
      {props.children}
    </StyledButton>
  );
};

Button.defaultProps = {
  children: null,
  onClick: () => {
    // this is intentional (required by Sonarcloud)
  },
};

export default Button;
