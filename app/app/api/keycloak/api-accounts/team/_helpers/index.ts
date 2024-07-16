import KcAdminClient from '@keycloak/keycloak-admin-client';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { AUTH_RELM } from '@/config';

export async function syncClientUserRoles(kcAdminClient: KcAdminClient, clientUid: string, users: { email: string }[]) {
  const memberRole = await kcAdminClient.clients.findRole({
    realm: AUTH_RELM,
    id: clientUid,
    roleName: 'member',
  });

  const exisitingUsers = await kcAdminClient.clients.findUsersWithRole({
    realm: AUTH_RELM,
    id: clientUid,
    roleName: 'member',
  });

  // Remove all existing users
  await Promise.all(
    exisitingUsers.map(async (user) => {
      if (!user.id) return;

      const roleMapping = {
        realm: AUTH_RELM,
        id: user.id,
        clientUniqueId: clientUid,
        roles: [memberRole as RoleMappingPayload],
      };

      await kcAdminClient.users.delClientRoleMappings(roleMapping);
    }),
  );

  // Add new users
  await Promise.all(
    users.map(async (user) => {
      const kusers = await kcAdminClient.users.find({ exact: true, email: user.email });
      if (kusers.length > 0 && kusers[0].id) {
        const roleMapping = {
          realm: AUTH_RELM,
          id: kusers[0].id,
          clientUniqueId: clientUid,
          roles: [memberRole as RoleMappingPayload],
        };

        await kcAdminClient.users.addClientRoleMappings(roleMapping);
      }
    }),
  );
}
