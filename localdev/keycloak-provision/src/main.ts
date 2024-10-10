import waitOn from 'wait-on';
import mockFile from '../../m365proxy/mocks.json' with { type: 'json' };
import { KcAdmin } from '../../_packages/keycloak-admin/src/main.js';
import {
  KEYCLOAK_URL,
  MASTER_ADMIN,
  MASTER_ADMIN_PASSWORD,
  AUTH_REALM_NAME,
  AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET,
  GITOPS_CLIENT_ID,
  GITOPS_CLIENT_SECRET,
  ADMIN_CLIENT_ID,
  ADMIN_CLIENT_SECRET,
  PUBLIC_CLOUD_REALM_NAME,
  PUBLIC_CLOUD_CLIENT_ID,
  PUBLIC_CLOUD_CLIENT_SECRET,
} from './config.js';

interface MsUser {
  id: string;
  onPremisesSamAccountName: string;
  userPrincipalName: string;
  mail: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
}

const clientScope = 'https://graph.microsoft.com/.default';

let proxyUsers: MsUser[] = [];
const usersMock = mockFile.mocks.find((mock) => mock.request.url === 'https://graph.microsoft.com/v1.0/users?$filter*');
if (usersMock?.response.body?.value) {
  proxyUsers = usersMock.response.body?.value;
}

async function main() {
  console.log('Starting Keycloak Provision...');

  await waitOn({
    resources: [`${KEYCLOAK_URL}/health/ready`],
    delay: 1000,
    window: 5000,
  });

  const kc = new KcAdmin({
    baseUrl: KEYCLOAK_URL,
    realmName: 'master',
    username: MASTER_ADMIN,
    password: MASTER_ADMIN_PASSWORD,
  });

  await kc.auth();

  // Create auth realm & client
  const authRealm = await kc.upsertRealm(AUTH_REALM_NAME, { enabled: true });
  const authClient = await kc.createPrivateClient(AUTH_REALM_NAME, AUTH_CLIENT_ID, AUTH_CLIENT_SECRET);

  const scope = await kc.createRealmClientScope(AUTH_REALM_NAME, clientScope);

  kc.cli.clients.addDefaultClientScope({
    realm: AUTH_REALM_NAME,
    id: authClient?.id as string,
    clientScopeId: scope?.id as string,
  });

  // Create ministry level roles
  [
    'aest',
    'ag',
    'agri',
    'alc',
    'bcpc',
    'citz',
    'dbc',
    'eao',
    'educ',
    'embc',
    'empr',
    'env',
    'fin',
    'flnr',
    'hlth',
    'irr',
    'jedc',
    'lbr',
    'ldb',
    'mah',
    'mcf',
    'mmha',
    'psa',
    'pssg',
    'sdpr',
    'tca',
    'tran',
    'hous',
  ].forEach(async (ministry) => {
    await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `ministry-${ministry}-reader`);
    await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `ministry-${ministry}-editor`);
  });

  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `billing-reviewer`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `billing-reader`);

  // Upsert GitOps client
  await kc.createServiceAccount(AUTH_REALM_NAME, GITOPS_CLIENT_ID, GITOPS_CLIENT_SECRET);

  // Upsert Admin client
  await kc.createRealmAdminServiceAccount(AUTH_REALM_NAME, ADMIN_CLIENT_ID, ADMIN_CLIENT_SECRET);

  const authUsers = proxyUsers.map(({ surname, givenName, mail, jobTitle }) => ({
    username: mail,
    email: mail,
    firstName: givenName,
    lastName: surname,
    password: mail,
    roles: [jobTitle],
  }));

  // Create Auth Users with auth roles assigned
  await kc.upsertUsersWithClientRoles(AUTH_REALM_NAME, authClient?.id as string, authUsers);

  // Create public cloud realm & client
  await kc.upsertRealm(PUBLIC_CLOUD_REALM_NAME, { enabled: true });
  await kc.createRealmAdminServiceAccount(PUBLIC_CLOUD_REALM_NAME, PUBLIC_CLOUD_CLIENT_ID, PUBLIC_CLOUD_CLIENT_SECRET);

  return {
    authRealm,
    authClient,
  };
}

main().then(console.log).catch(console.error);
