import axios from 'axios';
import { getClientCredentialsToken } from '@/utils/node';

const tenantId = process.env.AZURE_TENANT_ID!;
const clientId = process.env.AZURE_CLIENT_ID!;
const clientSecret = process.env.AZURE_CLIENT_SECRET!;

const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

async function getAccessToken() {
  const token = await getClientCredentialsToken(
    tokenUrl,
    clientId,
    clientSecret,
    'https://graph.microsoft.com/.default',
  );

  if (!token) {
    throw new Error('Failed to get access token');
  }

  return token;
}

async function main() {
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

main().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
});
