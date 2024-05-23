import { Session } from 'next-auth';
import createApiHandler from '@/core/api-handler';
import { generateSession } from '@/core/auth-options';
import prisma from '@/core/prisma';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { ministryKeyToName } from '@/helpers/product';
import { findUser } from '@/services/keycloak/app-realm';

const apiHandler = createApiHandler({
  keycloakOauth2: { requiredClaims: ['kc-userid'] },
});
export const GET = apiHandler(async ({ queryParams, jwtData }) => {
  const kcUserId = jwtData['kc-userid'];
  const kcUser = await findUser(kcUserId);
  if (!kcUser) return BadRequestResponse('keycloak user not found');

  const session = await generateSession({
    session: {} as Session,
    token: { email: kcUser.email, roles: kcUser.authRoleNames },
  });

  const products = await prisma.publicCloudProject.findMany({
    where: {},
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
    session: session as never,
  });

  return OkResponse(
    products.map((product) => {
      return {
        licencePlate: product.licencePlate,
        name: product.name,
        description: product.description,
        ministry: product.ministry,
        ministryName: ministryKeyToName(product.ministry),
        provider: product.provider,
        projectOwner: {
          firstName: product.projectOwner.firstName,
          lastName: product.projectOwner.lastName,
        },
        primaryTechnicalLead: {
          firstName: product.primaryTechnicalLead.firstName,
          lastName: product.primaryTechnicalLead.lastName,
        },
        secondaryTechnicalLead: product.secondaryTechnicalLead
          ? {
              firstName: product.secondaryTechnicalLead.firstName,
              lastName: product.secondaryTechnicalLead.lastName,
            }
          : null,
      };
    }),
  );
});
