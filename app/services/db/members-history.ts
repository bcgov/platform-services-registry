import _isEqual from 'lodash-es/isEqual';
import _sortBy from 'lodash-es/sortBy';
import { RequestType, Prisma, User } from '@/prisma/client';
import { getUsersInfoByIds } from './user';

export type MembersHistoryResponse = {
  requests: MemberChangeItem[];
  users: User[];
};

export interface UserWithRoleChanges {
  userId: string;
  prevRoles: string[];
  newRoles: string[];
}

export type MemberChangeItem = {
  request: {
    id: string;
    type: RequestType;
    date: string;
  };
  items: UserWithRoleChanges[];
};

const contactFieldMap = {
  projectOwnerId: 'projectOwner',
  primaryTechnicalLeadId: 'primaryTechnicalLead',
  secondaryTechnicalLeadId: 'secondaryTechnicalLead',
  expenseAuthorityId: 'expenseAuthority',
};

type ContactField = keyof typeof contactFieldMap;

type RequestWithData = PublicCloudRequestWithData | PrivateCloudRequestWithData;

type PublicCloudRequestWithData = Prisma.PublicCloudRequestGetPayload<{
  select: {
    id: true;
    type: true;
    createdAt: true;
    changes: true;
    originalData: {
      select: Record<ContactField | 'members', true>;
    };
    decisionData: {
      select: Record<ContactField | 'members', true>;
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
      select: Record<Exclude<ContactField, 'expenseAuthorityId'> | 'members', true>;
    };
    decisionData: {
      select: Record<Exclude<ContactField, 'expenseAuthorityId'> | 'members', true>;
    };
  };
}>;

export async function buildMembersHistory(requests: RequestWithData[]) {
  const userRoles = new Map<string, Set<string>>();
  const history: MemberChangeItem[] = [];

  for (const request of requests) {
    const diff = buildRequestDiff(request);
    const updatedRoles: UserWithRoleChanges[] = [];

    const itemMap = new Map<string, { prev: Set<string>; next: Set<string> }>();

    for (const { userId, prevRoles, newRoles } of diff.items) {
      const currentRoles = new Set(userRoles.get(userId) ?? []);
      const entry = itemMap.get(userId) ?? { prev: new Set(), next: new Set(currentRoles) };

      for (const role of prevRoles) {
        if (entry.next.has(role)) {
          entry.prev.add(role);
          entry.next.delete(role);
        }
      }

      for (const role of newRoles) {
        entry.next.add(role);
      }

      itemMap.set(userId, entry);
    }

    for (const [userId, { prev, next }] of itemMap.entries()) {
      const prevSorted = deduplicateAndSort([...prev]);
      const nextSorted = deduplicateAndSort([...next]);

      const current = userRoles.get(userId) ?? new Set();
      const filteredNewRoles = nextSorted.filter((role) => !current.has(role));
      const isNewUser = !userRoles.has(userId);
      const hasChanges = prevSorted.length > 0 || filteredNewRoles.length > 0;

      let newRoles: string[] = [];

      if (filteredNewRoles.length > 0) {
        newRoles = filteredNewRoles;
      } else if ((isNewUser || filteredNewRoles.length === 0) && request.changes?.parentPaths.includes('members')) {
        newRoles = ['additional team member without roles'];
      }

      const shouldInclude = hasChanges || isNewUser || diff.items.some((item) => item.userId === userId);

      if (shouldInclude) {
        updatedRoles.push({ userId, prevRoles: prevSorted, newRoles });
        userRoles.set(userId, new Set(nextSorted));
      }
    }

    if (updatedRoles.length > 0) {
      history.push({ request: diff.request, items: updatedRoles });
    }
  }

  const userIds = Array.from(new Set(history.flatMap((request) => request.items.map((item) => item.userId))));

  const users = await getUsersInfoByIds(userIds);

  return { requests: history, users };
}

function buildRequestDiff(request: RequestWithData) {
  const { originalData, decisionData, changes, type } = request;
  const userRoleMap = new Map<string, UserWithRoleChanges>();

  const addRoleChange = (userId: string, role: string, direction: 'prev' | 'next') => {
    const entry = getOrCreateRoleEntry(userRoleMap, userId);
    if (direction === 'prev') {
      entry.prevRoles.push(role);
    } else {
      entry.newRoles.push(role);
    }
  };

  if (type === RequestType.EDIT && changes) {
    if (changes.contactsChanged) {
      const changedFields = getContactFields(changes.parentPaths);

      for (const field of changedFields) {
        const roleName = contactFieldMap[field];
        const originalUserId = originalData?.[field];
        const decisionUserId = decisionData?.[field];

        if (originalUserId !== decisionUserId) {
          if (originalUserId) addRoleChange(originalUserId, roleName, 'prev');
          if (decisionUserId) addRoleChange(decisionUserId, roleName, 'next');
        }
      }
    }

    if (changes.membersChanged) {
      const { roleChanges } = getChangedMemberDiffs(originalData?.members, decisionData?.members);
      for (const [userId, { prevRoles, newRoles }] of roleChanges.entries()) {
        const entry = getOrCreateRoleEntry(userRoleMap, userId);
        entry.prevRoles.push(...prevRoles);
        entry.newRoles.push(...newRoles);
      }
    }
  }

  if (type === RequestType.CREATE) {
    for (const [field, role] of Object.entries(contactFieldMap)) {
      const userId = decisionData?.[field];
      if (!userId) continue;

      const entry = getOrCreateRoleEntry(userRoleMap, userId);
      entry.newRoles.push(role);
    }
  }

  for (const item of userRoleMap.values()) {
    item.prevRoles = deduplicateAndSort(item.prevRoles);
    item.newRoles = deduplicateAndSort(item.newRoles);
    if (type === RequestType.CREATE) item.prevRoles = [];
  }

  return {
    request: {
      id: request.id,
      type: request.type,
      date: request.createdAt.toDateString(),
    },
    items: Array.from(userRoleMap.values()),
  };
}

function getContactFields(paths: string[]): ContactField[] {
  return paths.map((role) => `${role}Id`).filter((key): key is ContactField => key in contactFieldMap);
}

function getOrCreateRoleEntry(map: Map<string, UserWithRoleChanges>, userId: string) {
  const entry = map.get(userId) ?? { userId, prevRoles: [], newRoles: [] };
  map.set(userId, entry);
  return entry;
}

function deduplicateAndSort(roles: string[]) {
  return [...new Set(roles)].sort();
}

function mapMembersByUserId(members: { userId: string; roles?: string[] }[]) {
  return new Map(members.map(({ userId, roles }) => [userId, roles?.length ? roles : []]));
}

function getChangedMemberDiffs(
  originalMembers: { userId: string; roles?: string[] }[] = [],
  decisionMembers: { userId: string; roles?: string[] }[] = [],
) {
  const originalMap = mapMembersByUserId(originalMembers);
  const decisionMap = mapMembersByUserId(decisionMembers);
  const roleChanges = new Map<string, { prevRoles: string[]; newRoles: string[] }>();

  const allUserIds = deduplicateAndSort([...originalMap.keys(), ...decisionMap.keys()]);

  for (const userId of allUserIds) {
    const prev = originalMap.get(userId);
    const next = decisionMap.get(userId);

    const prevRoles = prev ?? [];
    const nextRoles = next ?? [];

    const userWasAdded = !originalMap.has(userId) && decisionMap.has(userId);
    const userWasRemoved = originalMap.has(userId) && !decisionMap.has(userId);

    const rolesChanged = !_isEqual(_sortBy(prevRoles), _sortBy(nextRoles));

    if (userWasAdded || userWasRemoved || rolesChanged) {
      roleChanges.set(userId, { prevRoles: prevRoles, newRoles: nextRoles });
    }
  }

  return { roleChanges };
}
