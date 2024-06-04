import KcAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';

function castArray(value: string | string[]) {
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function onlyUnique(value: string, index: number, array: string[]) {
  return array.indexOf(value) === index;
}

function uniq(values: string[]) {
  return values.filter(onlyUnique);
}

interface KcUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export class KcAdmin {
  private _username: string;

  private _password: string;

  private _kcAdminClient: KcAdminClient;

  constructor({
    baseUrl,
    realmName,
    username,
    password,
  }: {
    baseUrl: string;
    realmName: string;
    username: string;
    password: string;
  }) {
    this._username = username;
    this._password = password;
    this._kcAdminClient = new KcAdminClient({
      baseUrl,
      realmName,
    });
  }

  get kcAdminClient() {
    return this._kcAdminClient;
  }

  async auth() {
    await this._kcAdminClient.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: this._username,
      password: this._password,
    });
  }

  async findRealm(realm: string) {
    return this._kcAdminClient.realms.findOne({ realm });
  }

  async createRealm(realm: string) {
    const _realm = await this.findRealm(realm);
    if (_realm) return _realm;

    await this._kcAdminClient.realms.create({ realm, displayName: realm });
    return this.findRealm(realm);
  }

  async upsertRealm(realm: string, payload: RealmRepresentation) {
    await this.createRealm(realm);
    await this._kcAdminClient.realms.update({ realm }, payload);
    return this.findRealm(realm);
  }

  async findClient(realm: string, clientId: string) {
    const _clients = await this._kcAdminClient.clients.find({ realm, clientId });
    return _clients?.length > 0 ? _clients[0] : null;
  }

  async createClient(realm: string, clientId: string) {
    const _client = await this.findClient(realm, clientId);
    if (_client) return _client;

    await this._kcAdminClient.clients.create({ realm, clientId });
    return this.findClient(realm, clientId);
  }

  async upsertClient(realm: string, clientId: string, payload: ClientRepresentation) {
    const _client = await this.createClient(realm, clientId);

    await this._kcAdminClient.clients.update({ realm, id: _client?.id as string }, payload);
    return this.findClient(realm, clientId);
  }

  async createPrivateClient(realm: string, clientId: string, clientSecret: string) {
    const _client = await this.upsertClient(realm, clientId, {
      enabled: true,
      publicClient: false,
      serviceAccountsEnabled: true,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      redirectUris: ['*'],
      secret: clientSecret,
    });

    return _client;
  }

  async createServiceAccount(realm: string, clientId: string, clientSecret: string) {
    const _client = await this.upsertClient(realm, clientId, {
      enabled: true,
      publicClient: false,
      serviceAccountsEnabled: true,
      standardFlowEnabled: false,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      secret: clientSecret,
    });

    return _client;
  }

  async createRealmAdminServiceAccount(realm: string, clientId: string, clientSecret: string) {
    const _client = await this.createServiceAccount(realm, clientId, clientSecret);

    const realmManagementClient = await this.findClient(realm, 'realm-management');
    const realmAdminRole = await this._kcAdminClient.clients.findRole({
      realm,
      id: realmManagementClient?.id as string,
      roleName: 'realm-admin',
    });

    const adminClientUser = await this._kcAdminClient.clients.getServiceAccountUser({
      realm,
      id: _client?.id as string,
    });

    await this._kcAdminClient.users.addClientRoleMappings({
      realm,
      id: adminClientUser.id as string,
      clientUniqueId: realmManagementClient?.id as string,
      roles: [realmAdminRole as RoleMappingPayload],
    });
  }

  async createRealmClientScope(realm: string, clientScope: string) {
    let scope = await this._kcAdminClient.clientScopes.findOneByName({ realm, name: clientScope });
    if (scope) return scope;

    const newscope = await this._kcAdminClient.clientScopes.create({
      realm,
      name: clientScope,
      protocol: 'openid-connect',
      attributes: {
        'consent.screen.text': '',
        'display.on.consent.screen': 'true',
        'include.in.token.scope': 'true',
        'gui.order': '',
      },
    });

    await this._kcAdminClient.clientScopes.addDefaultOptionalClientScope({
      realm,
      id: newscope.id,
    });

    scope = await this._kcAdminClient.clientScopes.findOneByName({ realm, name: clientScope });
    return scope;
  }

  async findUserByEmail(realm: string, email: string) {
    const emailUsers = await this._kcAdminClient.users.find({ realm, email, exact: true });
    const user = emailUsers.find((user) => user.username === email);
    return user;
  }

  async createUser(realm: string, user: KcUser) {
    const { password, roles, ...rest } = user;

    // Catch an error if the user already exists
    try {
      const user = await this._kcAdminClient.users.create({
        ...rest,
        enabled: true,
        realm,
        emailVerified: true,
      });

      await this._kcAdminClient.users.resetPassword({
        realm,
        id: user.id,
        credential: { temporary: false, type: 'password', value: password },
      });
    } catch (err) {
      console.error('createUser:', user, err);
    }

    const currUser = await this.findUserByEmail(realm, rest.email);
    return currUser;
  }

  async findClinetRole(realm: string, clientUniqueId: string, roleName: string) {
    const _role = await this._kcAdminClient.clients.findRole({
      realm,
      id: clientUniqueId,
      roleName,
    });

    return _role;
  }

  async createClientRole(realm: string, clientUniqueId: string, roleName: string) {
    let role = await this.findClinetRole(realm, clientUniqueId, roleName);
    if (role) return role;

    try {
      await this._kcAdminClient.clients.createRole({
        realm,
        id: clientUniqueId,
        name: roleName,
      });
    } catch (err) {
      console.error('createClientRole:', roleName, err);
    }

    role = await this.findClinetRole(realm, clientUniqueId, roleName);
    return role;
  }

  async upsertUsersWithClientRoles(realm: string, clientUniqueId: string, users: KcUser[]) {
    const allClientRoles = await this._kcAdminClient.clients.listRoles({
      realm,
      id: clientUniqueId,
    });

    await Promise.all(
      users.map(async ({ email, username, firstName, lastName, password, roles = [] }) => {
        email = email.toLowerCase();
        roles = uniq(castArray(roles)).filter(Boolean);

        const currUser = await this.createUser(realm, { email, username, firstName, lastName, password, roles });

        // Revoke all client roles from the user
        await this._kcAdminClient.users.delClientRoleMappings({
          realm,
          id: currUser?.id as string,
          clientUniqueId,
          roles: allClientRoles as RoleMappingPayload[],
        });

        // Assign a roles
        const _roles = await Promise.all(roles.map((role) => this.createClientRole(realm, clientUniqueId, role)));
        await this._kcAdminClient.users.addClientRoleMappings({
          realm,
          id: currUser?.id as string,
          clientUniqueId,
          roles: _roles as never as RoleMappingPayload[],
        });
      }),
    );
  }
}
