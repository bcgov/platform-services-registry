import { KeycloakProvider } from '@react-keycloak/web';
import React from 'react';
import keycloak from '../keycloak';
import Footer from './footer';
import Form from './form';
import Header from './header';


const App = () => {
  return <KeycloakProvider keycloak={keycloak}>
    <div >
      <Header />
      <Form />
      <Footer />
    </div>
  </KeycloakProvider>
}

export default App;
