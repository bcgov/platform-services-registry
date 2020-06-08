import { KeycloakProvider } from '@react-keycloak/web';
import React from 'react';
import keycloak from '../keycloak';
import './App.css';
import Header from './Header';

const App = () => {
  return <KeycloakProvider keycloak={keycloak}>
    <div className="App">
      <Header />
    </div>
  </KeycloakProvider>
}

export default App;
