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
// distributed under the License is distributed on an 'AS IS' BASIS,git 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { KeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import AppRouter from './AppRouter';
import keycloak from './keycloak';
import theme from './theme';


const eventLogger = (event: unknown, error: unknown) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens: unknown) => {
  console.log('onKeycloakTokens', tokens)
}


const App = () => {
  return (
    <KeycloakProvider
      keycloak={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
    >
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </KeycloakProvider>
  )
}

export default App;
