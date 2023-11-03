import { URLSearchParams } from 'url';
import { User } from '@prisma/client';

const getToken = async (): Promise<string> => {
  const url = process.env.MAUTIC_TOKEN_URL || '';

  const authString = `${process.env.MAUTIC_CLIENT_ID}:${process.env.MAUTIC_SUBSSCRIPTION_API_CLIENT_SECRET}`;
  const encodedAuthString = Buffer.from(authString).toString('base64');

  const params = {
    grant_type: 'client_credentials',
  };

  const urlData = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedAuthString}`,
      },
      body: urlData,
      credentials: 'include',
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getContactId = async (email: string, token: string): Promise<string> => {
  const mauticSubscriptionUrlBase = process.env.MAUTIC_SUBSSCRIPTION_API_URL || '';

  try {
    const response = await fetch(`${mauticSubscriptionUrlBase}/segments`, {
      headers: {
        Email: email,
        Connection: 'keep-alive',
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
    });

    const segments = await response.json();
    return segments.contactId;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const subscribe = async (user: User, token: string, cluster: string, platform: string): Promise<Response> => {
  const contactId = await getContactId(user.email, token);
  const mauticSubscriptionUrlBase = process.env.MAUTIC_SUBSSCRIPTION_API_URL || '';

  try {
    const response = await fetch(`${mauticSubscriptionUrlBase}/segments/contact/cluster/add`, {
      method: 'POST',
      headers: {
        Connection: 'keep-alive',
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        ContactId: contactId,
        platformName: platform,
        clusterName: cluster,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const subscribeUserToMautic = async (user: User, cluster: string, platform: string) => {
  try {
    const token = await getToken();
    const response = await subscribe(user, token, cluster, platform);
  } catch (error) {
    console.log('MAUTIC FAILED TO SUBSCRIBE USER', error);
  }
};

export const subscribeUsersToMautic = async (users: User[], cluster: string, platform: string) => {
  try {
    const token = await getToken();
    const promises = users.map((user) => subscribe(user, token, cluster, platform));

    await Promise.all(promises);
  } catch (error) {
    console.log('MAUTIC ERROR', error);
  }
};
