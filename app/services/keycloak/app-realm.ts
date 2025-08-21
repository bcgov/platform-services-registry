import KcAdminClient from '@keycloak/keycloak-admin-client';
import RoleRepresentation, { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import _mapKeys from 'lodash-es/mapKeys';
import _uniq from 'lodash-es/uniq';
import _uniqBy from 'lodash-es/uniqBy';
import {
  AUTH_SERVER_URL,
  AUTH_RELM,
  AUTH_RESOURCE,
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
} from '@/config';
import { GlobalRole } from '@/constants';

export async function getKcAdminClient() {
  const kcAdminClient = new KcAdminClient({
    baseUrl: AUTH_SERVER_URL,
    realmName: AUTH_RELM,
  });

  await kcAdminClient.auth({
    grantType: 'client_credentials',
    clientId: KEYCLOAK_ADMIN_CLIENT_ID,
    clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
  });

  return kcAdminClient;
}

export async function findClients(prefix: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const clients = await kcAdminClient.clients.find({
    realm: AUTH_RELM,
    clientId: prefix,
    search: true,
  });

  return clients.filter((client) => client.clientId?.startsWith(prefix));
}

export async function findClient(clientId: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const clients = await kcAdminClient.clients.find({
    realm: AUTH_RELM,
    clientId,
  });

  return clients.length > 0 ? clients[0] : null;
}

export async function findUser(userId: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const user = await kcAdminClient.users.findOne({
    realm: AUTH_RELM,
    id: userId,
    userProfileMetadata: true,
  });

  const authClient = await findClient(AUTH_RESOURCE, kcAdminClient);
  if (!authClient?.id) return null;

  const authRoles = await kcAdminClient.users.listClientRoleMappings({
    realm: AUTH_RELM,
    id: userId,
    clientUniqueId: authClient.id,
  });

  return { ...user, authRoleNames: authRoles.map((role) => role.name ?? '') };
}

export async function listClientRoles(clientId: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const client = await findClient(clientId, kcAdminClient);
  if (!client?.id) return [];

  const roles = await kcAdminClient.clients.listRoles({
    realm: AUTH_RELM,
    id: client.id,
  });

  return roles;
}

export async function findUsersByClientRole(clientId: string, roleName: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const client = await findClient(clientId, kcAdminClient);
  if (!client?.id) return [];

  const users = await kcAdminClient.clients.findUsersWithRole({
    realm: AUTH_RELM,
    id: client.id,
    roleName,
  });

  return users;
}

export async function findUserEmailsByAuthRole(roleName: GlobalRole, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const users = await findUsersByClientRole(AUTH_RESOURCE, roleName, kcAdminClient);
  return users.map((v) => v.email ?? '').filter(Boolean);
}

export async function listUsers(kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  // See https://www.keycloak.org/docs-api/latest/rest-api/index.html#_get_adminrealmsrealmusers
  const users = await kcAdminClient.users.find({
    realm: AUTH_RELM,
    briefRepresentation: false,
    first: 0,
    max: 100,
  });

  return users;
}

export async function listUsersByRole(roleName: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const client = await findClient(AUTH_RESOURCE, kcAdminClient);
  if (!client?.id) return [];

  const users = await kcAdminClient.clients.findUsersWithRole({
    realm: AUTH_RELM,
    id: client.id,
    roleName,
    briefRepresentation: false,
  });

  return users;
}

export async function listUsersByRoles(roleNames: string[], kcAdminClient?: KcAdminClient) {
  const adminClient = kcAdminClient || (await getKcAdminClient());
  const client = await findClient(AUTH_RESOURCE, adminClient);

  if (!client?.id) {
    return { usersByRole: {}, users: [] };
  }

  const uniqueRoleNames = _uniq(roleNames);

  const userGroupsPromises = uniqueRoleNames.map((roleName) =>
    adminClient.clients.findUsersWithRole({
      realm: AUTH_RELM,
      id: client.id!,
      roleName,
      briefRepresentation: false,
    }),
  );

  const userGroups = await Promise.all(userGroupsPromises);

  const usersByRole: Record<string, UserRepresentation[]> = {};
  const collectedUsers: UserRepresentation[] = [];

  userGroups.forEach((userGroup, index) => {
    const roleName = uniqueRoleNames[index];
    usersByRole[roleName] = userGroup.filter((user) => {
      const isValidEmail = user.email && user.email.toLowerCase() === user.username?.toLowerCase();
      if (isValidEmail) collectedUsers.push(user);
      return isValidEmail;
    });
  });

  return { usersByRole, users: _uniqBy(collectedUsers, (user) => user.id) };
}

export async function findUserByEmail(email: string, kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  email = email.toLowerCase();

  const users = await kcAdminClient.users.find({
    realm: AUTH_RELM,
    username: email,
    exact: true,
    userProfileMetadata: false,
  });

  const user = users.find((usr) => usr.username?.toLowerCase() === email);
  if (!user) return null;

  const authClient = await findClient(AUTH_RESOURCE, kcAdminClient);
  if (!authClient?.id) return null;

  const authRoles = await kcAdminClient.users.listClientRoleMappings({
    realm: AUTH_RELM,
    id: user.id as string,
    clientUniqueId: authClient.id,
  });

  return { ...user, authRoleNames: authRoles.map((role) => role.name ?? '') };
}

export async function updateUserRoles(email: string, roleNames: string[], kcAdminClient?: KcAdminClient) {
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  email = email.toLowerCase();

  const users = await kcAdminClient.users.find({
    realm: AUTH_RELM,
    username: email,
    exact: true,
    userProfileMetadata: false,
  });

  const user = users.find((usr) => usr.username?.toLowerCase() === email);
  if (!user?.id) return null;

  const authClient = await findClient(AUTH_RESOURCE, kcAdminClient);
  if (!authClient?.id) return null;

  const oldRoles = await kcAdminClient.users.listClientRoleMappings({
    realm: AUTH_RELM,
    id: user.id,
    clientUniqueId: authClient.id,
  });

  await kcAdminClient.users.delClientRoleMappings({
    realm: AUTH_RELM,
    id: user.id,
    clientUniqueId: authClient.id,
    roles: oldRoles.map(({ id, name }) => ({ id, name })) as RoleMappingPayload[],
  });

  const newRoles = (
    await Promise.all(
      roleNames.map((roleName) =>
        kcAdminClient.clients.findRole({
          realm: AUTH_RELM,
          id: authClient.id as string,
          roleName,
        }),
      ),
    )
  ).filter(Boolean) as RoleRepresentation[];

  await kcAdminClient.users.addClientRoleMappings({
    realm: AUTH_RELM,
    id: user.id,
    clientUniqueId: authClient.id,
    roles: newRoles.map(({ id, name }) => ({ id, name })) as RoleMappingPayload[],
  });

  return { roles: newRoles.map((v) => v.name) };
}
export async function findClientRole(
  clientId: string,
  roleName: string,
  kcAdminClient?: KcAdminClient,
): Promise<RoleRepresentation | null> {
  const adminClient = kcAdminClient || (await getKcAdminClient());
  return adminClient.clients.findRole({
    realm: AUTH_RELM,
    id: clientId,
    roleName,
  });
}

export async function ensureClientRole(
  clientId: string,
  roleName: string,
  details: RoleRepresentation,
  kcAdminClient?: KcAdminClient,
): Promise<RoleRepresentation | null> {
  const adminClient = kcAdminClient || (await getKcAdminClient());

  const authClient = await findClient(AUTH_RESOURCE, adminClient);
  if (!authClient?.id) return null;

  const existingRole = await findClientRole(authClient.id, roleName, adminClient);
  if (existingRole) {
    await adminClient.clients.updateRole(
      {
        realm: AUTH_RELM,
        id: authClient.id,
        roleName,
      },
      details,
    );
  } else {
    await adminClient.clients.createRole({
      realm: AUTH_RELM,
      ...details,
      id: authClient.id,
      name: roleName,
    });
  }

  return findClientRole(authClient.id, roleName, adminClient);
}

export async function removeClientRole(
  clientId: string,
  roleName: string,
  kcAdminClient?: KcAdminClient,
): Promise<boolean> {
  const adminClient = kcAdminClient || (await getKcAdminClient());

  const authClient = await findClient(clientId, adminClient);
  if (!authClient?.id) return false;

  const existingRole = await findClientRole(authClient.id, roleName, adminClient);
  if (!existingRole) return true;

  await adminClient.clients.delRole({
    realm: AUTH_RELM,
    id: authClient.id,
    roleName,
  });

  return true;
}

export async function reassignUsersToRole(
  clientId: string,
  fromRoleName: string,
  toRoleName: string,
  kcAdminClient?: KcAdminClient,
): Promise<boolean> {
  const adminClient = kcAdminClient || (await getKcAdminClient());

  const authClient = await findClient(clientId, adminClient);
  if (!authClient?.id) return false;

  const toRole = await findClientRole(authClient.id, toRoleName, adminClient);
  if (!toRole) return false;

  const users = await findUsersByClientRole(clientId, fromRoleName, adminClient);
  const aa = await Promise.all(
    users.map((user) => {
      return adminClient.users.addClientRoleMappings({
        realm: AUTH_RELM,
        id: user.id!,
        clientUniqueId: authClient.id!,
        roles: [{ id: toRole.id, name: toRole.name }] as RoleMappingPayload[],
      });
    }),
  );

  return true;
}
