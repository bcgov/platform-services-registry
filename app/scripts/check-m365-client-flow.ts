import { ClientSecretCredential } from '@azure/identity';
import axios from 'axios';

const tenantId = process.env.AZURE_TENANT_ID!;
const clientId = process.env.AZURE_CLIENT_ID!;
const clientSecret = process.env.AZURE_CLIENT_SECRET!;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

async function getAccessToken(): Promise<string> {
  const token = await credential.getToken('https://graph.microsoft.com/.default');
  if (!token?.token) {
    throw new Error('Failed to get access token');
  }
  return token.token;
}

async function listUsers() {
  const accessToken = await getAccessToken();

  const response = await axios.get('https://graph.microsoft.com/v1.0/users?$top=5', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('--- User List ---');
  response.data.value.forEach((user: { displayName: string; userPrincipalName: string }, index: number) => {
    console.log(`${index + 1}. ${user.displayName} <${user.userPrincipalName}>`);
  });
}

listUsers().catch((err) => {
  console.error('Error listing users:', err.response?.data || err.message);
});
