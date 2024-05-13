import { $Enums } from '@prisma/client';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { Session } from 'next-auth';
import { sendDeleteRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { isEligibleForDeletion } from '@/helpers/openshift';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { deletePathParamSchema } from '../[licencePlate]/schema';
import { getPrivateCloudProduct, excludeProductUsers } from '@/queries/private-cloud-products';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { user } = session;
  const { licencePlate } = pathParams;

  const product = excludeProductUsers(await getPrivateCloudProduct(session, licencePlate));

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const canDelete = await isEligibleForDeletion(product.licencePlate, product.cluster);
  if (!canDelete) {
    return BadRequestResponse(
      'this project is not deletable as it is not empty. Please delete all resources before deleting the project.',
    );
  }

  const { id, requests, updatedAt, _permissions, ...rest } = product;

  const createRequest = await prisma.privateCloudRequest.create({
    data: {
      type: $Enums.RequestType.DELETE,
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
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

  await sendDeleteRequestEmails(createRequest, session.user.name);

  return OkResponse(true);
}
