import waitOn from 'wait-on';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const m365ProxyResponse = require('./responses.json');

const keycloakUrl = process.env.KEYCLOAK_URL;
const realmName = process.env.REALM_NAME;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const gitOpsclientId = process.env.GITOPS_CLIENT_ID;
const gitOpsclientSecret = process.env.GITOPS_CLIENT_SECRET;
const clientScope = 'https://graph.microsoft.com/.default';

const proxyUsers = m365ProxyResponse.responses.find(
  (res) => res.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
).responseBody.value;

async function main() {
  console.log('Starting Keycloak Provision...');

  await waitOn({
    resources: [`${keycloakUrl}/health/ready`],
    delay: 1000,
    window: 5000,
  });

  // Create KC admin client
  const kcAdminClient = new KcAdminClient({
    baseUrl: keycloakUrl,
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

  const findClient = (cid = clientId) =>
    kcAdminClient.clients
      .findOne({ realm: realmName, clientId: cid })
      .then((clients) => (clients?.length > 0 ? clients[0] : null));

  // Create Realm if not exist
  let realm = await findRealm();
  if (!realm) {
    await kcAdminClient.realms.create({ id: realm, realm: realmName, displayName: realmName });
  }

  let scope = null;

  // Update Realm
  realm = await findRealm();
  if (realm) {
    await kcAdminClient.realms.update(
      { realm: realmName },
      {
        enabled: true,
      },
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

  realm = await findRealm();

  // Create Client if not exist
  let client = await findClient();
  if (!client) {
    await kcAdminClient.clients.create({ realm: realmName, clientId });
  }

  const clientRoles = {};
  const roleNamesExists = proxyUsers.map((v) => v.jobTitle).filter((v) => !!v);

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
      },
    );

    client = await findClient();
    kcAdminClient.clients.addDefaultClientScope({
      realm: realmName,
      id: client.id,
      clientScopeId: scope.id,
    });

    for (let x = 0; x < roleNamesExists.length; x++) {
      const roleName = roleNamesExists[x];

      const getRole = () =>
        kcAdminClient.clients.findRole({
          realm: realmName,
          id: client.id,
          roleName,
        });

      let role = await getRole();
      if (!role) {
        await kcAdminClient.clients.createRole({
          realm: realmName,
          id: client.id,
          name: roleName,
        });

        role = await getRole();
      }

      clientRoles[roleName] = role;
    }
  }

  client = await findClient();

  const allClientRoles = await kcAdminClient.clients.listRoles({
    realm: realmName,
    id: client.id,
  });

  // Upsert GitOps client
  (async () => {
    let gitopsClient = await findClient(gitOpsclientId);
    if (!gitopsClient) {
      await kcAdminClient.clients.create({ realm: realmName, clientId: gitOpsclientId });
    }

    gitopsClient = await findClient(gitOpsclientId);
    if (gitopsClient) {
      await kcAdminClient.clients.update(
        { realm: realmName, id: gitopsClient.id },
        {
          enabled: true,
          publicClient: false,
          serviceAccountsEnabled: true,
          standardFlowEnabled: false,
          implicitFlowEnabled: false,
          directAccessGrantsEnabled: false,
          secret: gitOpsclientSecret,
        },
      );
    }
  })();

  // Create Users
  await Promise.all(
    proxyUsers.map(async ({ surname, givenName, mail, jobTitle }) => {
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

      const allUsers = await kcAdminClient.users.find({ realm: realmName });
      const currUser = allUsers.find((user) => user.username === mail.toLowerCase());

      if (currUser) {
        // Revoke all client roles from the user
        await kcAdminClient.users.delClientRoleMappings({
          realm: realmName,
          id: currUser.id,
          clientUniqueId: client.id,
          roles: allClientRoles,
        });

        // Assign a role based on their job title
        if (jobTitle) {
          await kcAdminClient.users.addClientRoleMappings({
            realm: realmName,
            id: currUser.id,
            clientUniqueId: client.id,
            roles: [clientRoles[jobTitle]],
          });
        }
      }
    }),
  );

  return {
    realm,
    client,
    clientRoles,
  };
}

main().then(console.log).catch(console.error);
