import { ProtocolMode } from '@azure/msal-node';

let msalConfig = {};
if (process.env.APP_ENV === 'localdev') {
  const oidcBaseUrl = process.env.OIDC_AUTHORITY;
  msalConfig = {
    auth: {
      protocolMode: ProtocolMode.OIDC,
      authority: `${oidcBaseUrl}`,
      authorityMetadata: JSON.stringify({
        authorization_endpoint: `${oidcBaseUrl}/protocol/openid-connect/auth`,
        token_endpoint: `${oidcBaseUrl}/protocol/openid-connect/token`,
        issuer: `${oidcBaseUrl}`,
        userinfo_endpoint: `${oidcBaseUrl}/protocol/openid-connect/userinfo`,
      }),
      clientId: process.env.AUTH_RESOURCE,
      clientSecret: process.env.AUTH_SECRET,
      knownAuthorities: [`${oidcBaseUrl}`],
    },
  };
} else {
  msalConfig = {
    auth: {
      protocolMode: ProtocolMode.AAD,
      authority: process.env.MS_GRAPH_API_AUTHORITY,
      clientId: process.env.MS_GRAPH_API_CLIENT_ID,
      clientSecret: process.env.MS_GRAPH_API_CLIENT_SECRET,
    },
  };
}

export default msalConfig;
