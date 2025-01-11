import { DecisionStatus, EventType, PublicCloudRequest } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { createEvent, models } from '@/services/db';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.publicCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});

export const PUT = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.publicCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.cancel) {
    return UnauthorizedResponse();
  }

  const { data: updatedRequest } = await models.publicCloudRequest.update(
    {
      where: {
        id,
        decisionStatus: DecisionStatus.PENDING,
        active: true,
      },
      data: {
        decisionStatus: DecisionStatus.CANCELLED,
      },
      select: {
        decisionStatus: true,
        createdByEmail: true,
        licencePlate: true,
        decisionData: true,
        decisionDataId: true,
        requestDataId: true,
        createdBy: {
          select: {
            id: true,
          },
        },
      },
    },
    session,
  );

  const { decisionDataId, requestDataId, licencePlate } = updatedRequest as unknown as PublicCloudRequest;

  const billingData = await prisma.billing.findFirst({
    where: {
      licencePlate,
    },
    select: {
      expenseAuthorityId: true,
    },
  });

  await prisma.publicCloudRequestedProject.updateMany({
    where: {
      expenseAuthorityId: billingData?.expenseAuthorityId,
    },
    data: {
      expenseAuthorityId: null,
      billingId: null,
    },
  });

  await prisma.billing.deleteMany({
    where: {
      licencePlate,
      signed: false,
    },
  });

  await prisma.task.deleteMany({
    where: {
      data: {
        equals: {
          licencePlate,
        },
      },
    },
  });

  await prisma.publicCloudRequest.update({
    where: { id },
    data: {
      decisionDataId,
      requestDataId,
    },
  });

  await createEvent(EventType.CANCEL_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: id });

  return OkResponse(true);
});
