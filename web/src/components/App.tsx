import { KeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import keycloak from '../keycloak';
import theme from '../theme';
import Footer from './footer';
import Form from './form';
import Header from './header';

const App = () => {
  return (
    <KeycloakProvider keycloak={keycloak}>
      <ThemeProvider theme={theme}>
        <div >
          <Header />
          <Form />
          <Footer />
        </div>
      </ThemeProvider>
    </KeycloakProvider>
  )
}

export default App;
