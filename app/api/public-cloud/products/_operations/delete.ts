import { $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPublicCloudProduct, excludeProductUsers } from '@/queries/public-cloud-products';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { user } = session;
  const { licencePlate } = pathParams;

  const product = excludeProductUsers(await getPublicCloudProduct(session, licencePlate));

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const { id, requests, updatedAt, _permissions, ...rest } = product;

  const createRequest = await prisma.publicCloudRequest.create({
    data: {
      type: $Enums.PublicCloudRequestType.DELETE,
      decisionStatus: $Enums.DecisionStatus.PENDING,
      active: true,
      createdByEmail: user.email,
      licencePlate: product.licencePlate,
      originalData: {
        create: rest,
      },
      decisionData: {
        create: { ...rest, status: $Enums.ProjectStatus.INACTIVE },
      },
      requestData: {
        create: { ...rest, status: $Enums.ProjectStatus.INACTIVE },
      },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: {
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  await Promise.all([
    sendDeleteRequestEmails(createRequest.decisionData, session.user.name),
    sendAdminDeleteRequestEmails(createRequest.decisionData),
  ]);

  return OkResponse(true);
}
