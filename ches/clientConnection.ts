import axios, { AxiosInstance } from 'axios';
import oauth from 'axios-oauth-client';

export default class ClientConnection {
  public axios: AxiosInstance;

  constructor({ tokenUrl, clientId, clientSecret }: { tokenUrl: string; clientId: string; clientSecret: string }) {
    if (!tokenUrl || !clientId || !clientSecret) {
      console.log('Invalid configuration.', { function: 'constructor' });
      throw new Error('ClientConnection is not configured. Check configuration.');
    }

    const getClientCredentials = oauth.clientCredentials(axios.create(), tokenUrl, clientId, clientSecret);

    this.axios = axios.create();
    this.axios.interceptors.request.use(
      async (config) => {
        const auth = await getClientCredentials('');
        config.headers['Authorization'] = `Bearer ${auth.access_token}`;
        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );
  }
}
