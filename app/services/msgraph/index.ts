import { AxiosRequestConfig } from 'axios';
import { M365_URL } from '@/config';
import { parseMinistryFromDisplayName } from '@/helpers/user';
import { MsUser, AppUser } from '@/types/user';
import { callMsGraph, getAccessToken } from './core';

export function processMsUser(user: MsUser): AppUser | null {
  const idir = user.onPremisesSamAccountName;
  const upn = user.userPrincipalName;

  return {
    id: '',
    providerUserId: user.id,
    upn,
    email: user.mail.toLowerCase(),
    idir,
    idirGuid: user.extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID,
    displayName: user.displayName,
    firstName: user.givenName,
    lastName: user.surname,
    ministry: parseMinistryFromDisplayName(user.displayName),
    jobTitle: user.jobTitle || '',
    officeLocation: user.officeLocation || '',
  };
}

export async function sendRequest(url: string, options: AxiosRequestConfig = {}) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw Error('invalid access token');
  }

  const data = await callMsGraph(url, accessToken, options);
  return data;
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
  'officeLocation',
  'jobTitle',
  // 'mobilePhone',
  // 'businessPhones',
];

const userSelect = `$select=${userAttributes.join(',')}`;

// See https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
export async function getUser(idOrUserPrincipalName: string) {
  const url = `${M365_URL}/v1.0/users/${idOrUserPrincipalName}?${userSelect}`;
  const data = await sendRequest(url);

  return data ? processMsUser(data as MsUser) : null;
}

// See https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
export async function listUsersByEmail(email: string) {
  const filter = `$filter=startswith(mail,'${email}')`;
  const orderby = '$orderby=userPrincipalName';
  const count = '$count=true';
  const top = '$top=25';
  const query = [filter, userSelect, orderby, count, top].join('&');

  const url = `${M365_URL}/v1.0/users?${query}`;
  const data = await sendRequest(url);

  if (!data) return [];

  return (data as { value: MsUser[] }).value.map(processMsUser).filter((user) => !!user);
}

export async function getUserByEmail(email: string) {
  const users = await listUsersByEmail(email);
  const matchingUsers = users.filter((user) => user.email.toLowerCase() === email.toLowerCase());
  if (matchingUsers.length === 0) return null;

  return matchingUsers[0];
}

export async function getUserPhoto(email: string) {
  const url = `${M365_URL}/v1.0/users/${email}/photo/$value`;
  const data = await sendRequest(url, { responseType: 'arraybuffer' });

  return data;
}
