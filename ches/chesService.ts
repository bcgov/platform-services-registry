import ClientConnection from './clientConnection';

const SERVICE = 'CHES';

interface Email {
  bodyType: 'html' | 'text';
  body: string;
  to: (string | undefined)[];
  from: string;
  subject: string;
}

export default class ChesService {
  private connection: ClientConnection;
  private axios;
  private apiUrl: string;

  constructor({
    tokenUrl,
    clientId,
    clientSecret,
    apiUrl,
  }: {
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    apiUrl: string;
  }) {
    if (!tokenUrl || !clientId || !clientSecret || !apiUrl) {
      console.log('Invalid configuration.', { function: 'constructor' });
      throw new Error('ChesService is not configured. Check configuration.');
    }
    this.connection = new ClientConnection({
      tokenUrl,
      clientId,
      clientSecret,
    });
    this.axios = this.connection.axios;
    this.apiUrl = apiUrl;
  }

  async send(email: Email) {
    try {
      const { data, status } = await this.axios.post(`${this.apiUrl}/email`, email, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return { data, status };
    } catch (e) {
      console.log('Error', e);
    }
  }
}
