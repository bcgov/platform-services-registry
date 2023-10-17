import waitOn from 'wait-on';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const m365ProxyResponse = require('./responses.json');

const realmName = process.env.REALM_NAME;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientScope = 'https://graph.microsoft.com/.default';

const proxyUsers = m365ProxyResponse.responses.find((res) => res.url === 'https://graph.microsoft.com/v1.0/users*')
  .responseBody.value;

async function main() {
  console.log('Starting Keycloak Provision...');

  await waitOn({
    resources: ['http://keycloak:8080/health/ready'],
  });

  // Create KC admin client
  const kcAdminClient = new KcAdminClient({
    baseUrl: 'http://keycloak:8080',
    realmName: 'master',
    requestConfig: {
      timeout: 10000,
    },
  });

  // Authenticate KC admin client
  await kcAdminClient.auth({
    grantType: 'password',
    clientId: 'admin-cli',
    username: process.env.KEYCLOAK_ADMIN,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
  });

  const findRealm = () => kcAdminClient.realms.findOne({ realm: realmName });

  const findClient = () =>
    kcAdminClient.clients
      .findOne({ realm: realmName, clientId })
      .then((clients) => (clients?.length > 0 ? clients[0] : null));

  // Create Realm if not exist
  let realm = await findRealm();
  if (!realm) {
    await kcAdminClient.realms.create({ id: realm, realm: realmName, displayName: realmName });
  }

  let scope = null;

  // Upate Realm
  realm = await findRealm();
  if (realm) {
    await kcAdminClient.realms.update(
      { realm: realmName },
      {
        enabled: true,
      }
    );

    scope = await kcAdminClient.clientScopes.findOneByName({ realm: realmName, name: clientScope });
    if (!scope) {
      await kcAdminClient.clientScopes.create({
        realm: realmName,
        name: clientScope,
        type: 'optional',
        protocol: 'openid-connect',
        attributes: {
          'consent.screen.text': '',
          'display.on.consent.screen': 'true',
          'include.in.token.scope': 'true',
          'gui.order': '',
        },
      });

      scope = await kcAdminClient.clientScopes.findOneByName({ realm: realmName, name: clientScope });
      await kcAdminClient.clientScopes.addDefaultOptionalClientScope({ realm: realmName, id: scope.id });
    }

    scope = await kcAdminClient.clientScopes.findOneByName({ realm: realmName, name: clientScope });
  }

  // Create Client if not exist
  let client = await findClient();
  if (!client) {
    await kcAdminClient.clients.create({ realm: realmName, clientId });
  }

  // Update Client
  client = await findClient();
  if (client) {
    await kcAdminClient.clients.update(
      { realm: realmName, id: client.id },
      {
        enabled: true,
        publicClient: false,
        serviceAccountsEnabled: true,
        standardFlowEnabled: true,
        implicitFlowEnabled: false,
        directAccessGrantsEnabled: false,
        redirectUris: ['*'],
        secret: clientSecret,
      }
    );

    client = await findClient();
    kcAdminClient.clients.addDefaultClientScope({
      realm: realmName,
      id: client.id,
      clientScopeId: scope.id,
    });
  }

  // Create Users
  await Promise.all(
    proxyUsers.map(async ({ surname, givenName, mail }) => {
      try {
        const user = await kcAdminClient.users.create({
          enabled: true,
          realm: realmName,
          emailVerified: true,
          username: mail,
          email: mail,
          firstName: givenName,
          lastName: surname,
        });

        await kcAdminClient.users.resetPassword({
          realm: realmName,
          id: user.id,
          credential: { temporary: false, type: 'password', value: mail.toLowerCase() },
        });
      } catch {}
    })
  );

  return {
    realm: await findRealm(),
    client: await findClient(),
  };
}

main().then(console.log).catch(console.error);
