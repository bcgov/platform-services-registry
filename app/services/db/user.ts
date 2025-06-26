import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { Prisma, PrivateCloudRequestData, PublicCloudRequestData } from '@/prisma/client';
import { listUsersByRoles, findUserByEmail, getKcAdminClient } from '@/services/keycloak/app-realm';
import { getUserByEmail, getUserPhoto } from '@/services/msgraph';
import { AppUser } from '@/types/user';
import { arrayBufferToBase64 } from '@/utils/js';
import { UserSearchBody } from '@/validation-schemas';

export async function prepareUserData(user: AppUser, extra = {}) {
  const email = user.email.toLowerCase();

  const image = await getUserPhoto(email);
  const data = {
    email,
    providerUserId: user.providerUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    ministry: user.ministry,
    idir: user.idir,
    idirGuid: user.idirGuid,
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
}): Promise<{ data: SearchUser[]; totalCount: number }> {
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

  const [data, totalCount] = await Promise.all([
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
  ]);

  return { data, totalCount };
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

export async function enrichMembersWithEmail(data: PublicCloudRequestData | PrivateCloudRequestData | null) {
  if (!data?.members?.length) return data;

  const userIds = Array.from(new Set(data.members.map((m) => m.userId).filter((id): id is string => !!id)));

  const users = await getUsersEmailsByIds(userIds);
  const userMap = new Map(users.map((u) => [u?.id, u]));

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
