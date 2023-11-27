import compact from 'lodash.compact';
import uniq from 'lodash.uniq';
import castArray from 'lodash.castarray';

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
}

interface TokenData {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}

const safeEmails = (emails: Array<NullOrString>): string[] => uniq(compact(castArray(emails)));

const getToken = async ({ tokenUrl, clientId, clientSecret }: TokenData): Promise<string | null> => {
  try {
    const response = await fetch(tokenUrl, {
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
      console.error('Error retrieving token:', response.statusText);
      return null;
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('Exception retrieving token:', error);
    return null;
  }
};

const sendEmail = async (email: Email): Promise<void> => {
  if (!process.env.CHES_TOKEN_URL || !process.env.CHES_CLIENT_ID || !process.env.CHES_CLIENT_SECRET) {
    console.error('Missing environment variables for email service');
    return;
  }

  const tokenData: TokenData = {
    tokenUrl: process.env.CHES_TOKEN_URL || '',
    clientId: process.env.CHES_CLIENT_ID || '',
    clientSecret: process.env.CHES_CLIENT_SECRET || '',
  };

  const token = await getToken(tokenData);

  if (!token) {
    console.error('Unable to retrieve token for email service');
    return;
  }

  try {
    const apiUrl = process.env.CHES_API_URL || '';

    const response = await fetch(`${apiUrl}/email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodyType: email.bodyType || 'html',
        from: email.from || 'Registry <PlatformServicesTeam@gov.bc.ca>',
        subject: email.subject,
        body: email.body,
        to: safeEmails(email.to),
        // Provide an empty array as a fallback if bcc or cc is undefined
        bcc: safeEmails(email.bcc || []),
        cc: safeEmails(email.cc || []),
        delayTS: email.delayTS,
        encoding: email.encoding || 'utf-8',
        priority: email.priority || 'normal',
        tag: email.tag,
      }),
    });

    if (!response.ok) {
      console.error('Error sending email:', response.statusText);
      return;
    }

    const data = await response.json();
  } catch (error) {
    console.error('Exception sending email:', error);
  }
};

export { sendEmail };
