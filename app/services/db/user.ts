import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import {
  Prisma,
  PrivateCloudProductMember,
  PrivateCloudRequestData,
  PublicCloudProductMember,
  PublicCloudRequestData,
} from '@/prisma/client';
import { listUsersByRoles, findUserByEmail, getKcAdminClient } from '@/services/keycloak/app-realm';
import { getUserByEmail, getUserPhoto } from '@/services/msgraph';
import { AppUser, Outcome } from '@/types/user';
import { arrayBufferToBase64 } from '@/utils/js';
import { UserSearchBody } from '@/validation-schemas';

export async function prepareUserData(user: AppUser, extra = {}) {
  const email = user.email.toLowerCase();

  const image = await getUserPhoto(user.upn || email);
  const data = {
    email,
    providerUserId: user.providerUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    ministry: user.ministry,
    idir: user.idir,
    idirGuid: user.idirGuid,
    isGuidValid: user.isGuidValid,
    officeLocation: user.officeLocation,
    jobTitle: user.jobTitle,
    upn: user.upn,
    image: image ? arrayBufferToBase64(image) : '',
    ...extra,
  };

  return data;
}

export async function upsertUser(email: string, extra = {}) {
  if (!email) return null;

  try {
    email = email.toLowerCase();

    const adUser = await getUserByEmail(email);
    if (!adUser) return null;

    const data = await prepareUserData(adUser, extra);

    return await prisma.user.upsert({
      where: { email },
      update: data,
      create: data,
    });
  } catch (error) {
    logger.error('upsertUser:', error);
    return null;
  }
}

export async function upsertUsers(email: string | undefined | (string | undefined)[]) {
  const emails = _uniq(_compact(_castArray(email)));
  const result = await Promise.all(emails.map(upsertUser));
  return result;
}

export async function getMatchingUserIds(search: string) {
  if (search === '*') return [];

  const userSearchcreteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };
  const matchingUsers = await prisma.user.findMany({
    where: {
      OR: [{ email: userSearchcreteria }, { firstName: userSearchcreteria }, { lastName: userSearchcreteria }],
    },
    select: { id: true },
  });

  const matchingUserIds = matchingUsers.map((user) => user.id);
  return matchingUserIds;
}

const defaultSortKey = 'lastSeen';

type SearchUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    createdAt: true;
    updatedAt: true;
    lastSeen: true;
    onboardingDate: true;
  };
}>;

export async function searchUsers({
  skip,
  take,
  page,
  pageSize,
  search = '',
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
  extraFilter,
}: Omit<UserSearchBody, 'roles'> & {
  skip?: number;
  take?: number;
  extraFilter?: Prisma.UserWhereInput;
}): Promise<{ data: SearchUser[]; totalCount: number; allUsersHaveIdirGuid: boolean }> {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const where: Prisma.UserWhereInput = extraFilter ?? {};
  const orderBy = { [sortKey || defaultSortKey]: Prisma.SortOrder[sortOrder] };

  if (search === '*') search = '';

  if (search) {
    const searchCriteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };

    where.OR = [
      { firstName: searchCriteria },
      { lastName: searchCriteria },
      { email: searchCriteria },
      { officeLocation: searchCriteria },
      { jobTitle: searchCriteria },
      { ministry: searchCriteria },
    ];
  }

  const [data, totalCount, missingIdirGuidUser] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        upn: true,
        idir: true,
        idirGuid: true,
        officeLocation: true,
        jobTitle: true,
        image: true,
        ministry: true,
        archived: true,
        createdAt: true,
        updatedAt: true,
        lastSeen: true,
        onboardingDate: true,
      },
    }),
    prisma.user.count({
      where,
    }),
    prisma.user.findFirst({
      where: {
        OR: [{ idirGuid: null }, { idirGuid: { isSet: false } }, { idirGuid: '' }],
      },
      select: {
        idirGuid: true,
      },
    }),
  ]);
  const allUsersHaveIdirGuid = !missingIdirGuidUser;
  return { data, totalCount, allUsersHaveIdirGuid };
}

export async function searchUsersWithRoles({
  roles = [],
  page,
  pageSize,
  search = '',
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
}: UserSearchBody) {
  const isRoleSearch = roles.length > 0;
  const kcAdminClient = await getKcAdminClient();

  let usersByRole: { [key: string]: UserRepresentation[] };
  let roleEmails: string[] = [];

  if (isRoleSearch) {
    const ret = await listUsersByRoles(roles, kcAdminClient);
    usersByRole = ret.usersByRole;
    roleEmails = _compact(ret.users.map((user) => user.email?.toLocaleLowerCase()));
    if (roleEmails.length === 0) return { data: [], totalCount: 0 };
  }

  const result = await searchUsers({
    page,
    pageSize,
    search,
    sortKey,
    sortOrder,
    extraFilter: roleEmails.length ? { email: { in: roleEmails } } : {},
  });

  const findUserRoles = await (async () => {
    const kcProfiles = await Promise.all(result.data.map((v) => findUserByEmail(v.email, kcAdminClient)));
    return (email: string) => {
      email = email.toLowerCase();
      return kcProfiles.find((prof) => prof?.email && prof.email.toLowerCase() === email)?.authRoleNames ?? [];
    };
  })();

  result.data = await Promise.all(
    result.data.map(async (user, index) => {
      const [privateProducts, publicProducts] = await Promise.all([
        prisma.privateCloudProduct.findMany({
          where: {
            OR: [
              { projectOwnerId: user.id },
              { primaryTechnicalLeadId: user.id },
              { secondaryTechnicalLeadId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
          select: { licencePlate: true, name: true },
        }),
        prisma.publicCloudProduct.findMany({
          where: {
            OR: [
              { projectOwnerId: user.id },
              { primaryTechnicalLeadId: user.id },
              { secondaryTechnicalLeadId: user.id },
              { expenseAuthorityId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
          select: { licencePlate: true, name: true },
        }),
      ]);

      return {
        ...user,
        privateProducts,
        publicProducts,
        roles: findUserRoles(user.email),
      };
    }),
  );

  return result as {
    data: (SearchUser & {
      privateProducts: Prisma.PrivateCloudProductGetPayload<{
        select: {
          licencePlate: true;
          name: true;
        };
      }>[];
      publicProducts: Prisma.PublicCloudProductGetPayload<{
        select: {
          licencePlate: true;
          name: true;
        };
      }>[];
      roles: string[];
    })[];
    totalCount: number;
    allUsersHaveIdirGuid: boolean;
  };
}

export async function getUsersEmailsByIds(ids: (string | null | undefined)[]) {
  if (!ids || ids.length < 1) return [];

  const filteredIds = ids.filter((id): id is string => typeof id === 'string');

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: filteredIds,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return filteredIds.map((id) => userMap.get(id) ?? null);
}

export async function enrichMembersWithEmail<
  T extends Pick<PublicCloudRequestData | PrivateCloudRequestData, 'id' | 'members'>,
>(data: T | null) {
  if (!data?.members?.length) return data;

  const userIds = Array.from(
    new Set(
      data.members
        .map((member: PublicCloudProductMember | PrivateCloudProductMember) => member.userId)
        .filter((id): id is string => typeof id === 'string'),
    ),
  );

  const users = await getUsersEmailsByIds(userIds);
  const userMap = new Map(users.map((user) => [user?.id, user]));

  data.members = data.members.map((member: any) => {
    if (member.email) return member;

    const user = userMap.get(member.userId);
    return {
      ...member,
      email: user?.email ?? '',
    };
  });

  return data;
}

export async function getUsersInfoByIds(ids: (string | null | undefined)[]) {
  if (!ids || ids.length < 1) return [];

  const filteredIds = ids.filter((id): id is string => typeof id === 'string');

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: filteredIds,
      },
    },
  });

  const userMap = new Map(users.map((user) => [user.id, user]));

  return filteredIds.map((id) => userMap.get(id) ?? null);
}

export async function fixUsersMissingIdirGuid() {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ idirGuid: null }, { idirGuid: { isSet: false } }, { idirGuid: '' }],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      upn: true,
      idir: true,
      idirGuid: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
      lastSeen: true,
    },
  });

  const results: Array<{ id: string; email: string; outcome: Outcome; error?: string }> = [];

  for (const u of users) {
    try {
      await prisma.user.delete({ where: { id: u.id } });
      results.push({ id: u.id, email: u.email, outcome: 'deleted' });
    } catch (err: any) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          idirGuid: u.id,
          isGuidValid: false,
          archived: true,
        },
        select: { id: true },
      });

      const outcome: Outcome = 'archivedDueToError';

      results.push({
        id: u.id,
        email: u.email,
        outcome,
        error: String(err?.message ?? err),
      });
    }
  }

  const summary = {
    count: results.length,
    deleted: results.filter((r) => r.outcome === 'deleted').length,
    archivedDueToError: results.filter((r) => r.outcome === 'archivedDueToError').length,
    results,
  };
  return summary;
}
