import { RequestType, Prisma, User } from '@/prisma/client';

export interface UserWithRoleChanges extends User {
  prevRoles: string[];
  newRoles: string[];
}

type PublicCloudRequestWithData = Prisma.PublicCloudRequestGetPayload<{
  select: {
    id: true;
    type: true;
    createdAt: true;
    changes: true;
    originalData: {
      select: {
        projectOwnerId: true;
        primaryTechnicalLeadId: true;
        secondaryTechnicalLeadId: true;
        expenseAuthorityId: true;
        members: true;
      };
    };
    decisionData: {
      select: {
        projectOwnerId: true;
        primaryTechnicalLeadId: true;
        secondaryTechnicalLeadId: true;
        expenseAuthorityId: true;
        members: true;
      };
    };
  };
}>;
type PrivateCloudRequestWithData = Prisma.PrivateCloudRequestGetPayload<{
  select: {
    id: true;
    type: true;
    createdAt: true;
    changes: true;
    originalData: {
      select: {
        projectOwnerId: true;
        primaryTechnicalLeadId: true;
        secondaryTechnicalLeadId: true;
        members: true;
      };
    };
    decisionData: {
      select: {
        projectOwnerId: true;
        primaryTechnicalLeadId: true;
        secondaryTechnicalLeadId: true;
        members: true;
      };
    };
  };
}>;

export function collectChangedUserIds(requests: PublicCloudRequestWithData[] | PrivateCloudRequestWithData[]) {
  const userIds = new Set<string>();

  for (const { originalData, decisionData, changes } of requests) {
    if (changes) {
      if (changes.contactsChanged) {
        for (const field of getContactFields(changes.parentPaths)) {
          const originalUserId = originalData?.[`${field}Id`];
          const decisionUserId = decisionData?.[`${field}Id`];

          if (originalUserId !== decisionUserId) {
            if (originalUserId) userIds.add(originalUserId);
            if (decisionUserId) userIds.add(decisionUserId);
          }
        }
      }

      if (changes.membersChanged) {
        const originalUserMemberRoles = mapMembersByUserId(originalData?.members ?? []);
        const decisionUserMemberRoles = mapMembersByUserId(decisionData?.members ?? []);
        const allUserIds = new Set([...originalUserMemberRoles.keys(), ...decisionUserMemberRoles.keys()]);

        for (const userId of allUserIds) {
          const originalRoles = originalUserMemberRoles.get(userId) ?? [];
          const decisionRoles = decisionUserMemberRoles.get(userId) ?? [];
          if (!areRolesEqual(originalRoles, decisionRoles)) {
            userIds.add(userId);
          }
        }
      }
    } else {
      [
        decisionData.projectOwnerId,
        decisionData.primaryTechnicalLeadId,
        decisionData.secondaryTechnicalLeadId,
        'expenseAuthorityId' in decisionData ? decisionData.expenseAuthorityId : undefined,
      ].forEach((id) => id && userIds.add(id));
    }
  }

  return userIds;
}

export function buildRequestDiff(
  request: PublicCloudRequestWithData | PrivateCloudRequestWithData,
  userMap: Map<string, UserWithRoleChanges>,
) {
  const { originalData, decisionData, changes, type } = request;
  const itemsMap = new Map<string, UserWithRoleChanges>();

  if (type === RequestType.EDIT) {
    if (changes?.contactsChanged) {
      for (const field of getContactFields(changes.parentPaths)) {
        const originalUserId = originalData?.[`${field}Id`];
        const decisionUserId = decisionData?.[`${field}Id`];

        if (originalUserId !== decisionUserId) {
          if (originalUserId) {
            const user = userMap.get(originalUserId);
            if (user) {
              const entry = itemsMap.get(originalUserId) ?? { ...user, prevRoles: [], newRoles: [] };
              entry.prevRoles.push(contactFieldMap[field] ?? field);
              itemsMap.set(originalUserId, entry);
            }
          }

          if (decisionUserId) {
            const user = userMap.get(decisionUserId);
            if (user) {
              const entry = itemsMap.get(decisionUserId) ?? { ...user, prevRoles: [], newRoles: [] };
              entry.newRoles.push(contactFieldMap[field] ?? field);
              itemsMap.set(decisionUserId, entry);
            }
          }
        }
      }
    }

    if (changes?.membersChanged) {
      const originalMap = mapMembersByUserId(originalData?.members ?? []);
      const decisionMap = mapMembersByUserId(decisionData?.members ?? []);
      const allUserIds = new Set([...originalMap.keys(), ...decisionMap.keys()]);

      for (const userId of allUserIds) {
        const prev = originalMap.get(userId) ?? [];
        const next = decisionMap.get(userId) ?? [];

        if (!areRolesEqual(prev, next)) {
          const user = userMap.get(userId);
          if (user) {
            const entry = itemsMap.get(userId) ?? { ...user, prevRoles: [], newRoles: [] };
            entry.prevRoles.push(...prev);
            entry.newRoles.push(...next);
            itemsMap.set(userId, entry);
          }
        }
      }
    }
  }

  if (type === RequestType.CREATE) {
    for (const field of Object.keys(contactFieldMap)) {
      const userId = decisionData[field];
      if (userId) {
        const user = userMap.get(userId);
        if (user) {
          const entry = itemsMap.get(userId) ?? { ...user, prevRoles: [], newRoles: [] };
          entry.newRoles.push(contactFieldMap[field]);
          itemsMap.set(userId, entry);
        }
      }
    }
  }

  for (const user of itemsMap.values()) {
    user.prevRoles = [...new Set(user.prevRoles)];
    user.newRoles = [...new Set(user.newRoles)];

    if (type === RequestType.CREATE) {
      user.prevRoles = [];
    }
  }

  return {
    request: {
      id: request.id,
      type: request.type,
      date: request.createdAt,
    },
    items: Array.from(itemsMap.values()),
  };
}

const contactFieldMap = {
  projectOwnerId: 'projectOwner',
  primaryTechnicalLeadId: 'primaryTechnicalLead',
  secondaryTechnicalLeadId: 'secondaryTechnicalLead',
  expenseAuthorityId: 'expenseAuthority',
};

function getContactFields(paths: string[]) {
  return paths.filter((field) => field !== 'members');
}

function mapMembersByUserId(members: { userId: string; roles?: string[] }[]) {
  return new Map(members.map(({ userId, roles }) => [userId, roles ?? []]));
}

function areRolesEqual(originalRoles: string[], decisionRoles: string[]) {
  if (originalRoles.length !== decisionRoles.length) return false;
  const sortedOriginalRoles = [...originalRoles].sort();
  const sortedDecisionRoles = [...decisionRoles].sort();
  return sortedOriginalRoles.every((val, i) => val === sortedDecisionRoles[i]);
}
