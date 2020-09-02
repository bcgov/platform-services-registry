import Keycloak from 'keycloak-js';
import { SSO_BASE_URL, SSO_CLIENT_ID, SSO_REALM_NAME } from './constants';

const keycloak: any = Keycloak({
  url: `${SSO_BASE_URL}/auth`,
  realm: SSO_REALM_NAME,
  clientId: SSO_CLIENT_ID,
});

// keycloak.init({ checkLoginIframe: true });

export default keycloak;