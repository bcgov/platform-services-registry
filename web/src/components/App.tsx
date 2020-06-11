import styled from '@emotion/styled';
import { KeycloakProvider } from '@react-keycloak/web';
import React from 'react';
import keycloak from '../keycloak';
import Footer from './footer';
import Header from './header';

const StyledApp = styled.div`
  text-align: center;
`;

const App = () => {
  return <KeycloakProvider keycloak={keycloak}>
    <StyledApp >
      <Header />
      <Footer />
    </StyledApp>
  </KeycloakProvider>
}

export default App;
