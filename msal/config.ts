import { ProtocolMode, Configuration } from '@azure/msal-node';
import {
  IS_LOCAL,
  AUTH_RESOURCE,
  AUTH_SECRET,
  OIDC_AUTHORITY,
  MS_GRAPH_API_AUTHORITY,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
} from '@/config';

let msalConfig!: Configuration;
if (IS_LOCAL) {
  msalConfig = {
    auth: {
      protocolMode: ProtocolMode.OIDC,
      authority: `${OIDC_AUTHORITY}`,
      authorityMetadata: JSON.stringify({
        authorization_endpoint: `${OIDC_AUTHORITY}/protocol/openid-connect/auth`,
        token_endpoint: `${OIDC_AUTHORITY}/protocol/openid-connect/token`,
        issuer: `${OIDC_AUTHORITY}`,
        userinfo_endpoint: `${OIDC_AUTHORITY}/protocol/openid-connect/userinfo`,
      }),
      clientId: AUTH_RESOURCE,
      clientSecret: AUTH_SECRET,
      knownAuthorities: [`${OIDC_AUTHORITY}`],
    },
  };
} else {
  msalConfig = {
    auth: {
      protocolMode: ProtocolMode.AAD,
      authority: MS_GRAPH_API_AUTHORITY,
      clientId: MS_GRAPH_API_CLIENT_ID,
      clientSecret: MS_GRAPH_API_CLIENT_SECRET,
    },
  };
}

export default msalConfig;
