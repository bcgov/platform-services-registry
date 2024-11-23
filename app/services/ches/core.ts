import { render } from '@react-email/render';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _toLower from 'lodash-es/toLower';
import _uniq from 'lodash-es/uniq';
import { EMAIL_PREFIX, CHES_TOKEN_URL, CHES_API_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { privateCloudTeamEmail } from '@/constants';
import { logger } from '@/core/logging';

type NullOrString = string | null | undefined;
type EmailAddress = string | undefined;

interface Email {
  bodyType?: 'html' | 'text';
  from?: string;
  subject: string;
  body: string;
  to: EmailAddress[];
  bcc?: EmailAddress[];
  cc?: EmailAddress[];
  delayTS?: number;
  encoding?: 'base64' | 'binary' | 'hex' | 'utf-8';
  priority?: 'normal' | 'low' | 'high';
  tag?: string;
  attachments?: {
    content: string | Buffer;
    filename: string;
    contentType?: string;
    encoding?: 'base64' | 'binary' | 'hex';
  }[];
}

interface TokenData {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}

const safeEmails = (emails: Array<NullOrString>): string[] => _uniq(_compact(_castArray(emails)).map(_toLower));

const fetchWithTimeout = async (
  resource: RequestInfo,
  init?: RequestInit & { body?: BodyInit | null | undefined; headers?: HeadersInit | undefined },
  options?: { timeout: number },
) => {
  const { timeout = 5000 } = options ?? {};

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...(init ?? {}),
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
};

const getToken = async ({ tokenUrl, clientId, clientSecret }: TokenData): Promise<string | null> => {
  const response = await fetchWithTimeout(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    logger.error('Error retrieving token:', response.statusText);
    return null;
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

export const sendEmail = async (email: Email): Promise<void> => {
  if (!CHES_TOKEN_URL || !CHES_CLIENT_ID || !CHES_CLIENT_SECRET) {
    logger.error('Missing environment variables for email service');
    return;
  }

  const tokenData: TokenData = {
    tokenUrl: CHES_TOKEN_URL || '',
    clientId: CHES_CLIENT_ID || '',
    clientSecret: CHES_CLIENT_SECRET || '',
  };

  const token = await getToken(tokenData);

  if (!token) {
    logger.error('Unable to retrieve token for email service');
    return;
  }

  const apiUrl = CHES_API_URL || '';
  const subject = `${EMAIL_PREFIX}${email.subject}`;

  const response = await fetchWithTimeout(`${apiUrl}/email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bodyType: email.bodyType || 'html',
      from: email.from || `Registry <${privateCloudTeamEmail}>`,
      subject: subject,
      body: email.body,
      to: safeEmails(email.to),
      // Provide an empty array as a fallback if bcc or cc is undefined
      bcc: safeEmails(email.bcc || []),
      cc: safeEmails(email.cc || []),
      delayTS: email.delayTS,
      encoding: email.encoding || 'utf-8',
      priority: email.priority || 'normal',
      tag: email.tag,
      attachments: email.attachments,
    }),
  });

  if (!response.ok) {
    logger.error('Error sending email:', await response.json());
    return;
  }

  const data = await response.json();
  return data;
};

export const getContent = (jsx: JSX.Element) => render(jsx, { pretty: false });
