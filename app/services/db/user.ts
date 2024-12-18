import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Prisma, User } from '@prisma/client';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _isNumber from 'lodash-es/isNumber';
import _isString from 'lodash-es/isString';
import _uniq from 'lodash-es/uniq';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { listUsersByRoles, findUserByEmail, getKcAdminClient } from '@/services/keycloak/app-realm';
import { getUserByEmail, getUserPhoto, processMsUser } from '@/services/msgraph';
import { MsUser, AppUser } from '@/types/user';
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
        prisma.privateCloudProject.findMany({
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
        prisma.publicCloudProject.findMany({
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
      privateProducts: Prisma.PrivateCloudProjectGetPayload<{
        select: {
          licencePlate: true;
          name: true;
        };
      }>[];
      publicProducts: Prisma.PublicCloudProjectGetPayload<{
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
