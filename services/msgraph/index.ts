import { callMsGraph, getAccessToken } from './core';
import { MsUser, AppUser } from '@/types/user';
import { parseMinistryFromDisplayName } from '@/helpers/user';

export function processMsUser(user: MsUser): AppUser {
  return {
    id: user.id,
    upn: user.userPrincipalName,
    email: user.mail.toLowerCase(),
    idir: user.onPremisesSamAccountName,
    idirGuid: user.extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID,
    displayName: user.displayName,
    firstName: user.givenName,
    lastName: user.surname,
    ministry: parseMinistryFromDisplayName(user.displayName),
  };
}

export async function sendRequest(url: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw Error('invalid access token');
  }

  const response = await callMsGraph(url, accessToken);
  return response;
}

const userAttributes = [
  'id',
  'onPremisesSamAccountName',
  'userPrincipalName',
  'extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID', // pragma: allowlist secret
  'mail',
  'displayName',
  'givenName',
  'surname',
  'jobTitle',
];

const userSelect = `$select=${userAttributes.join(',')}`;

// See https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
export async function getUser(idOrUserPrincipalName: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${idOrUserPrincipalName}?${userSelect}`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return null;
  }

  const data = await res.json();
  return processMsUser(data as MsUser);
}

// See https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
export async function listUsersByEmail(email: string) {
  const filter = `$filter=startswith(mail,'${email}')`;
  const orderby = '$orderby=userPrincipalName';
  const count = '$count=true';
  const top = '$top=25';
  const query = [filter, userSelect, orderby, count, top].join('&');

  const url = `https://graph.microsoft.com/v1.0/users?${query}`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return [];
  }

  const data = await res.json();
  return (data as { value: MsUser[] }).value.map(processMsUser);
}

export async function getUserByEmail(email: string) {
  const users = await listUsersByEmail(email);
  const matchingUsers = users.filter((user) => user.email.toLowerCase() === email.toLowerCase());
  if (matchingUsers.length === 0) return null;

  return matchingUsers[0];
}

export async function getUserPhoto(email: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${email}/photo/$value`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return null;
  }

  const data = await res.arrayBuffer();
  return data;
}
