import compact from 'lodash.compact';
import uniq from 'lodash.uniq';
import castArray from 'lodash.castarray';

import ClientConnection from './clientConnection';

const SERVICE = 'CHES';

type nullstr = string | null | undefined;
const safeEmails = (v: nullstr | nullstr[]) => uniq(compact(castArray(v)));

interface Email {
  bodyType?: 'html' | 'text';
  from?: string;
  subject: string;
  body: string;
  to: (string | undefined)[];
  bcc?: (string | undefined)[];
  cc?: (string | undefined)[];
  delayTS?: number;
  encoding?: 'base64' | 'binary' | 'hex' | 'utf-8';
  priority?: 'normal' | 'low' | 'high';
  tag?: string;
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
    const {
      bodyType = 'html',
      from = 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject,
      body,
      to,
      bcc,
      cc,
      delayTS,
      encoding = 'utf-8',
      priority = 'normal',
      tag,
    } = email ?? {};

    try {
      const { data, status } = await this.axios.post(
        `${this.apiUrl}/email`,
        {
          bodyType,
          from,
          subject,
          body,
          to: safeEmails(to),
          bcc: safeEmails(bcc),
          cc: safeEmails(cc),
          delayTS,
          encoding,
          priority,
          tag,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );
      return { data, status };
    } catch (e) {
      console.log('Error', e);
    }
  }
}
