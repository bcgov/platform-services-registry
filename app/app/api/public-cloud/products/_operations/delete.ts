import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PublicCloudRequestType, DecisionStatus, ProjectStatus, EventType, TaskType } from '@/prisma/client';
import { sendDeleteRequestEmails } from '@/services/ches/public-cloud';
import {
  createEvent,
  models,
  publicCloudRequestDetailInclude,
  excludePublicProductPopulatedFields,
  getLastClosedPublicCloudRequest,
  tasks,
} from '@/services/db';
import { Comment } from '@/validation-schemas/shared';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  requestComment,
  pathParams,
}: {
  session: Session;
  requestComment: Comment;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = excludePublicProductPopulatedFields(
    (await models.publicCloudProduct.get({ where: { licencePlate } }, session)).data,
  );

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const { id, requests, updatedAt, _permissions, archivedAt, ...rest } = product;

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPublicCloudRequest(rest.licencePlate);

  const productData = { ...rest, status: ProjectStatus.INACTIVE };
  const newRequest = (
    await models.publicCloudRequest.create(
      {
        data: {
          type: PublicCloudRequestType.DELETE,
          decisionStatus: DecisionStatus.PENDING,
          active: true,
          createdBy: { connect: { email: session.user.email } },
          licencePlate: product.licencePlate,
          requestComment,
          originalData: { connect: { id: previousRequest?.decisionDataId } },
          requestData: { create: productData },
          decisionData: { create: productData },
          project: { connect: { licencePlate } },
        },
        include: publicCloudRequestDetailInclude,
      },
      session,
    )
  ).data;

  await Promise.all([
    createEvent(EventType.DELETE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_REQUEST, { request: newRequest, requester: session.user.name }),
    sendDeleteRequestEmails(newRequest, session.user.name),
  ]);

  return OkResponse(newRequest);
}
