import KcAdminClient from '@keycloak/keycloak-admin-client';
import {
  AUTH_SERVER_URL,
  AUTH_RELM,
  AUTH_RESOURCE,
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
} from '@/config';
import { logger } from '@/core/logging';

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
