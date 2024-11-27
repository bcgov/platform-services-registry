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
  if (!kcAdminClient) kcAdminClient = await getKcAdminClient();

  const client = await findClient(AUTH_RESOURCE, kcAdminClient);
  if (!client?.id) return { usersByRole: {}, users: [] };

  roleNames = _uniq(roleNames);

  const userGroups = await Promise.all(
    roleNames.map((roleName) =>
      kcAdminClient.clients.findUsersWithRole({
        realm: AUTH_RELM,
        id: client.id as string,
        roleName,
        briefRepresentation: false,
      }),
    ),
  );

  const allusers: UserRepresentation[] = [];
  const usersByRole = _mapKeys(userGroups, (users, index) => {
    allusers.push(...users);
    return roleNames[index];
  });

  return { usersByRole, users: _uniqBy(allusers, (usr) => usr.id) };
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
