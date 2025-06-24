import axios from 'axios';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _toLower from 'lodash-es/toLower';
import _uniq from 'lodash-es/uniq';
import sanitizeHtml from 'sanitize-html';
import { EMAIL_PREFIX, CHES_TOKEN_URL, CHES_API_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { privateCloudTeamEmail } from '@/constants';
import { logger } from '@/core/logging';
import { getClientCredentialsToken } from '@/utils/node';

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

const getToken = async ({ tokenUrl, clientId, clientSecret }: TokenData): Promise<string | null> => {
  const token = await getClientCredentialsToken(tokenUrl, clientId, clientSecret);

  if (!token) {
    logger.error('Error retrieving CHES API token');
    return null;
  }

  return token;
};

export async function sendEmail(email: Email) {
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

  const subject = `${EMAIL_PREFIX}${email.subject}`;

  const body = sanitizeHtml(
    email.body,
    // See https://github.com/apostrophecms/sanitize-html?tab=readme-ov-file#default-options
    {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['html', 'head', 'body', 'img', 'meta', 'style', 'link']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class'],
        link: ['rel', 'href'],
      },
      allowVulnerableTags: true, // 'style' tag for BCSans fonts
    },
  );

  logger.info(`Sending email: ${subject}`);

  try {
    const response = await axios.post<{
      messages: {
        msgId: string;
        to: string[];
      }[];
      txId: string;
    }>(
      `${CHES_API_URL}/email`,
      {
        bodyType: email.bodyType || 'html',
        from: email.from || `Registry <${privateCloudTeamEmail}>`,
        subject,
        body,
        to: safeEmails(email.to),
        // Provide an empty array as a fallback if bcc or cc is undefined
        bcc: safeEmails(email.bcc || []),
        cc: safeEmails(email.cc || []),
        delayTS: email.delayTS,
        encoding: email.encoding || 'utf-8',
        priority: email.priority || 'normal',
        tag: email.tag,
        attachments: email.attachments,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    );

    logger.info('Email sent', { result: response.data });
    return response.data;
  } catch (error) {
    logger.error('Error sending email:', error);
    return;
  }
}

export async function safeSendEmail(email: Email) {
  const result = await sendEmail(email);
  return result;
}
