import KcAdminClient from '@keycloak/keycloak-admin-client';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';

// Utility function to cast a value to an array
function castArray(value: string | string[]) {
  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

// Utility function to filter unique values in an array
function onlyUnique(value: string, index: number, array: string[]) {
  return array.indexOf(value) === index;
}

// Utility function to get unique values from an array
function uniq(values: string[]) {
  return values.filter(onlyUnique);
}

// Interface for Keycloak user representation
interface KcUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

// Keycloak Admin class to manage Keycloak administration tasks
export class KcAdmin {
  private _username?: string;

  private _password?: string;

  private _clientId?: string;

  private _clientSecret?: string;

  private _cli: KcAdminClient;

  // Constructor to initialize the Keycloak Admin client
  constructor({
    baseUrl,
    realmName,
    username,
    password,
    clientId,
    clientSecret,
  }: {
    baseUrl: string;
    realmName: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
  }) {
    this._username = username;
    this._password = password;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._cli = new KcAdminClient({
      baseUrl,
      realmName,
    });
  }

  // Getter for the Keycloak Admin client
  get cli() {
    return this._cli;
  }

  // Authenticate with Keycloak
  async auth() {
    const grantType = this._password ? 'password' : 'client_credentials';

    await this._cli.auth({
      grantType: grantType,
      clientId: this._clientId ?? 'admin-cli',
      clientSecret: this._clientSecret,
      username: this._username,
      password: this._password,
    });
  }

  // Find a realm by its name
  async findRealm(realm: string) {
    return this._cli.realms.findOne({ realm });
  }

  // Create a new realm if it doesn't exist
  async createRealm(realm: string) {
    const _realm = await this.findRealm(realm);
    if (_realm) return _realm;

    await this._cli.realms.create({ realm, displayName: realm });
    return this.findRealm(realm);
  }

  // Upsert a realm with the given payload
  async upsertRealm(realm: string, payload: RealmRepresentation) {
    await this.createRealm(realm);
    await this._cli.realms.update({ realm }, payload);
    return this.findRealm(realm);
  }

  // Find a client by its ID in a realm
  async findClient(realm: string, clientId: string) {
    const _clients = await this._cli.clients.find({ realm, clientId });
    return _clients?.length > 0 ? _clients[0] : null;
  }

  // Create a new client if it doesn't exist
  async createClient(realm: string, clientId: string) {
    const _client = await this.findClient(realm, clientId);
    if (_client) return _client;

    await this._cli.clients.create({ realm, clientId });
    return this.findClient(realm, clientId);
  }

  // Upsert a client with the given payload
  async upsertClient(realm: string, clientId: string, payload: ClientRepresentation) {
    const _client = await this.createClient(realm, clientId);

    await this._cli.clients.update({ realm, id: _client?.id as string }, payload);
    return this.findClient(realm, clientId);
  }

  // Create a private client with a secret
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

  // Create a service account for a client
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

  // Create a service account with realm-admin role
  async createRealmAdminServiceAccount(realm: string, clientId: string, clientSecret: string) {
    const _client = await this.createServiceAccount(realm, clientId, clientSecret);

    const realmManagementClient = await this.findClient(realm, 'realm-management');
    const realmAdminRole = await this._cli.clients.findRole({
      realm,
      id: realmManagementClient?.id as string,
      roleName: 'realm-admin',
    });

    const adminClientUser = await this._cli.clients.getServiceAccountUser({
      realm,
      id: _client?.id as string,
    });

    await this._cli.users.addClientRoleMappings({
      realm,
      id: adminClientUser.id as string,
      clientUniqueId: realmManagementClient?.id as string,
      roles: [realmAdminRole as RoleMappingPayload],
    });
  }

  // Create a client scope in a realm
  async createRealmClientScope(realm: string, clientScope: string) {
    let scope = await this._cli.clientScopes.findOneByName({ realm, name: clientScope });
    if (scope) return scope;

    const newscope = await this._cli.clientScopes.create({
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

    await this._cli.clientScopes.addDefaultOptionalClientScope({
      realm,
      id: newscope.id,
    });

    scope = await this._cli.clientScopes.findOneByName({ realm, name: clientScope });
    return scope;
  }

  // Find a user by email in a realm
  async findUserByEmail(realm: string, email: string) {
    const emailUsers = await this._cli.users.find({ realm, email, exact: true });
    const user = emailUsers.find((usr) => usr.username === email);
    return user;
  }

  // Create a new user in a realm
  async createUser(realm: string, kcuser: KcUser) {
    const { password, roles, ...rest } = kcuser;

    // Catch an error if the user already exists
    try {
      const user = await this._cli.users.create({
        ...rest,
        enabled: true,
        realm,
        emailVerified: true,
      });

      await this._cli.users.resetPassword({
        realm,
        id: user.id,
        credential: { temporary: false, type: 'password', value: password },
      });
    } catch (err) {
      console.error('createUser:', kcuser, err);
    }

    const currUser = await this.findUserByEmail(realm, rest.email);
    return currUser;
  }

  // Find a client role by its name
  async findClinetRole(realm: string, clientUniqueId: string, roleName: string) {
    const _role = await this._cli.clients.findRole({
      realm,
      id: clientUniqueId,
      roleName,
    });

    return _role;
  }

  // Create a new client role if it doesn't exist
  async createClientRole(realm: string, clientUniqueId: string, roleName: string) {
    let role = await this.findClinetRole(realm, clientUniqueId, roleName);
    if (role) return role;

    try {
      await this._cli.clients.createRole({
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

  // Upsert users with client roles in a realm
  async upsertUsersWithClientRoles(realm: string, clientUniqueId: string, users: KcUser[]) {
    const allClientRoles = await this._cli.clients.listRoles({
      realm,
      id: clientUniqueId,
    });

    await Promise.all(
      users.map(async ({ email: _email, username, firstName, lastName, password, roles: _roles }) => {
        const email = _email.toLowerCase();
        const roles = uniq(castArray(_roles || [])).filter(Boolean);

        const currUser = await this.createUser(realm, { email, username, firstName, lastName, password, roles });

        // Revoke all client roles from the user
        await this._cli.users.delClientRoleMappings({
          realm,
          id: currUser?.id as string,
          clientUniqueId,
          roles: allClientRoles as RoleMappingPayload[],
        });

        // Assign the new roles
        const newroles = await Promise.all(roles.map((role) => this.createClientRole(realm, clientUniqueId, role)));
        await this._cli.users.addClientRoleMappings({
          realm,
          id: currUser?.id as string,
          clientUniqueId,
          roles: newroles as never as RoleMappingPayload[],
        });
      }),
    );
  }

  async findGroup(realm: string, name: string) {
    const _groups = await this._cli.groups.find({ realm, search: name });
    if (!_groups || _groups.length === 0) return null;

    return _groups.find((grp) => grp.name === name) ?? null;
  }

  async createGroup(realm: string, name: string) {
    const _group = await this.findGroup(realm, name);
    if (_group) return _group;

    await this._cli.groups.create({ realm, name });
    return this.findGroup(realm, name);
  }

  async listChildGroups(realm: string, parentId: string) {
    const parentGroup = await this._cli.groups.findOne({ realm, id: parentId });
    if (!parentGroup || !parentGroup.subGroups) return [];

    return parentGroup.subGroups;
  }

  async findChildGroup(realm: string, parentId: string, name: string) {
    const subGroups = await this.listChildGroups(realm, parentId);
    return subGroups.find((grp) => grp.name === name);
  }

  async createChildGroup(realm: string, parentId: string, name: string) {
    const _group = await this.findChildGroup(realm, parentId, name);
    if (_group) return _group;

    await this._cli.groups.createChildGroup({ realm, id: parentId }, { name });
    return this.findChildGroup(realm, parentId, name);
  }
}
