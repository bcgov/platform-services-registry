import { ProjectStatus } from '@prisma/client';
import _uniq from 'lodash-es//uniq';
import _compact from 'lodash-es/compact';
import _remove from 'lodash-es/remove';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { UserDetail } from '@/types/user';
import { userUpdateBodySchema } from '@/validation-schemas';
import updateOp from '../_operations/update';
import { putPathParamSchema } from './schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: putPathParamSchema },
})(async ({ pathParams, session }) => {
  const productQuery = {
    where: { status: ProjectStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      projectOwnerId: true,
      primaryTechnicalLeadId: true,
      secondaryTechnicalLeadId: true,
    },
  };

  const user: UserDetail | null = await prisma.user.findUnique({
    where: { id: pathParams.id },
    select: {
      id: true,
      providerUserId: true,
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
      lastSeen: true,
      onboardingDate: true,
      privateCloudProjectsAsProjectOwner: productQuery,
      privateCloudProjectsAsPrimaryTechnicalLead: productQuery,
      privateCloudProjectsAsSecondaryTechnicalLead: productQuery,
      publicCloudProjectsAsProjectOwner: productQuery,
      publicCloudProjectsAsPrimaryTechnicalLead: productQuery,
      publicCloudProjectsAsSecondaryTechnicalLead: productQuery,
      publicCloudProjectsAsExpenseAuthority: productQuery,
    },
  });

  const userIds: string[] = [];
  if (user) {
    [
      user.privateCloudProjectsAsProjectOwner,
      user.privateCloudProjectsAsPrimaryTechnicalLead,
      user.privateCloudProjectsAsSecondaryTechnicalLead,
      user.publicCloudProjectsAsProjectOwner,
      user.publicCloudProjectsAsPrimaryTechnicalLead,
      user.publicCloudProjectsAsSecondaryTechnicalLead,
      user.publicCloudProjectsAsExpenseAuthority,
    ].forEach((products) => {
      products.forEach((prod) => {
        userIds.push(prod.projectOwnerId, prod.primaryTechnicalLeadId, prod.secondaryTechnicalLeadId ?? '');
      });
    });
  }

  const colleagues = await prisma.user.findMany({
    where: { id: { in: _uniq(_compact(_remove(userIds, (id) => id !== pathParams.id))) } },
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
      lastSeen: true,
    },
  });

  return OkResponse(user ? { ...user, colleagues } : null);
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.EditUserRoles, GlobalPermissions.EditUserOnboardingDate],
  validations: { pathParams: putPathParamSchema, body: userUpdateBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});
