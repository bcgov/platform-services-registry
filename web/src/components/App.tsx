import { KeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import keycloak from '../keycloak';
import theme from '../theme';
import AppRouter from './AppRouter';

const App = () => {
  return (
    <KeycloakProvider keycloak={keycloak}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </KeycloakProvider>
  )
}

export default App;
