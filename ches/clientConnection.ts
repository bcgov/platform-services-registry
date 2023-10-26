import axios, { AxiosInstance } from 'axios';
import oauth from 'axios-oauth-client';
import tokenProvider from 'axios-token-interceptor';

export default class ClientConnection {
  // public tokenUrl: string;
  public axios: AxiosInstance;

  constructor({ tokenUrl, clientId, clientSecret }: { tokenUrl: string; clientId: string; clientSecret: string }) {
    //console.log('ClientConnection', `Constructed with ${tokenUrl}, ${clientId}, clientSecret`);
    if (!tokenUrl || !clientId || !clientSecret) {
      console.log('Invalid configuration.', { function: 'constructor' });
      throw new Error('ClientConnection is not configured. Check configuration.');
    }

    this.axios = axios.create();
    this.axios.interceptors.request.use(
      // Wraps axios-token-interceptor with oauth-specific configuration,
      // fetches the token using the desired claim method, and caches
      // until the token expires
      oauth.interceptor(
        tokenProvider,
        oauth.client(axios.create(), {
          url: tokenUrl,
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          // scope: ""
        }),
      ),
    );
    // this.axios.interceptors.request.use(
    //   oauth.clientCredentials(
    //     axios.create(),
    //     tokenUrl,
    //     clientId,
    //     clientSecret,
    //   )
    // );
  }
}
