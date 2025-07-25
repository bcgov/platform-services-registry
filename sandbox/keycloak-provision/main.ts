import waitOn from 'wait-on';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KcAdmin } from '../_packages/keycloak-admin/src/main.js';
import { MsUser } from '../types.js';
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
  PROVISION_SERVICE_ACCOUNT_ID,
  PROVISION_SERVICE_ACCOUNT_SECRET,
} from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonData = readFileSync(path.join(__dirname, '../mock-users.json'), 'utf-8');
const msUsers: MsUser[] = JSON.parse(jsonData);

const clientScope = 'https://graph.microsoft.com/.default';

const ROLES = ['private-admin', 'public-admin'];

function getMapperPayload(name: string, claimValue: string) {
  const mapper = {
    name,
    protocol: 'openid-connect',
    protocolMapper: 'oidc-hardcoded-claim-mapper',
    config: {
      'claim.name': name,
      'claim.value': claimValue,
      'jsonType.label': 'String',
      'id.token.claim': 'true',
      'access.token.claim': 'true',
      'userinfo.token.claim': 'true',
      'access.tokenResponse.claim': 'false',
    },
  };
  return mapper;
}

async function main() {
  console.log('Starting Keycloak Provision...');

  await waitOn({
    resources: [`${KEYCLOAK_URL}/realms/master/.well-known/openid-configuration`],
    delay: 500,
    window: 5000,
  });

  const kc = new KcAdmin({
    baseUrl: KEYCLOAK_URL,
    realmName: 'master',
    username: MASTER_ADMIN,
    password: MASTER_ADMIN_PASSWORD,
  });

  let success = false;
  while (!success) {
    try {
      await kc.auth();
      success = true;
      console.log('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed, retrying...', error);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      }); // Delay for 1 second
    }
  }

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
    'emcr',
    'empr',
    'env',
    'fin',
    'flnr',
    'hlth',
    'irr',
    'jedc',
    'lbr',
    'ldb',
    'mcf',
    'mmha',
    'psa',
    'pssg',
    'sdpr',
    'tca',
    'tran',
    'hma',
    'wlrs',
  ].forEach(async (ministry) => {
    await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `ministry-${ministry}-reader`);
    await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `ministry-${ministry}-editor`);
  });

  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `billing-reviewer`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `billing-reader`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `finance-manager`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `private-reviewer`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `public-reviewer`);
  await kc.createClientRole(AUTH_REALM_NAME, authClient?.id as string, `user-reader`);

  // Upsert GitOps client
  await kc.createServiceAccount(AUTH_REALM_NAME, GITOPS_CLIENT_ID, GITOPS_CLIENT_SECRET);

  // Upsert Admin client
  await kc.createRealmAdminServiceAccount(AUTH_REALM_NAME, ADMIN_CLIENT_ID, ADMIN_CLIENT_SECRET);

  const authUsers = msUsers.map(({ surname, givenName, mail, jobTitle }) => ({
    username: mail,
    email: mail,
    firstName: givenName,
    lastName: surname,
    password: mail,
    roles: jobTitle ? jobTitle.split(',').map((role) => role.trim()) : [],
  }));

  // Create Auth Users with auth roles assigned
  await kc.upsertUsersWithClientRoles(AUTH_REALM_NAME, authClient?.id as string, authUsers);

  // Create public cloud realm & client
  await kc.upsertRealm(PUBLIC_CLOUD_REALM_NAME, { enabled: true });
  await kc.createRealmAdminServiceAccount(PUBLIC_CLOUD_REALM_NAME, PUBLIC_CLOUD_CLIENT_ID, PUBLIC_CLOUD_CLIENT_SECRET);

  const provisionServiceAccount = await kc.createServiceAccount(
    AUTH_REALM_NAME,
    PROVISION_SERVICE_ACCOUNT_ID,
    PROVISION_SERVICE_ACCOUNT_SECRET,
  );

  if (provisionServiceAccount?.id) {
    const { id: provisionClientUid } = provisionServiceAccount;

    await Promise.all([
      kc.cli.clients.addProtocolMapper(
        { realm: AUTH_REALM_NAME, id: provisionClientUid },
        getMapperPayload('roles', ROLES.join(',')),
      ),
      kc.cli.clients.addProtocolMapper(
        { realm: AUTH_REALM_NAME, id: provisionClientUid },
        getMapperPayload('service_account_type', 'team'),
      ),
    ]);
  }

  return {
    authRealm,
    authClient,
    provisionServiceAccount,
  };
}

main()
  .then((res) => {
    console.log(res);
    console.log('complete!');
  })
  .catch(console.error);
