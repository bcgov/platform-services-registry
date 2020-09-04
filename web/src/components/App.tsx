import { KeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Flex } from 'rebass';
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
          <ToastContainer style={{ width: "500px" }} />
          <Header />
          <Flex px={['60px', '130px']}>
            <Form />
          </Flex>
          <Footer />
        </div>
      </ThemeProvider>
    </KeycloakProvider>
  )
}

export default App;
