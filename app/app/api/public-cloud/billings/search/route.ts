import { RequestType, TaskStatus, TaskType } from '@prisma/client';
import _uniq from 'lodash-es/uniq';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { searchPublicCloudBillings } from '@/services/db/public-cloud-billing';
import { PublicCloudBillingSearchResponseMetadata } from '@/types/public-cloud';
import { publicCloudBillingSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudBillingSearchBodySchema },
})(async ({ body, session }) => {
  const { includeMetadata } = body;
  const { data, totalCount } = await searchPublicCloudBillings({ ...body, session });

  let metadata: PublicCloudBillingSearchResponseMetadata = null;
  if (includeMetadata) {
    const licencePlates = _uniq(data.map(({ licencePlate }) => licencePlate));

    const [publicProducts, publicCreateRequests, tasks] = await Promise.all([
      prisma.publicCloudProject.findMany({
        where: { licencePlate: { in: licencePlates } },
        select: { id: true, licencePlate: true, name: true, provider: true },
      }),
      prisma.publicCloudRequest.findMany({
        where: {
          type: RequestType.CREATE,
          licencePlate: { in: licencePlates },
        },
        select: {
          id: true,
          licencePlate: true,
          decisionData: { select: { name: true, provider: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          type: { in: [TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] },
          status: TaskStatus.ASSIGNED,
          OR: licencePlates.map((licencePlate) => ({ data: { equals: { licencePlate } } })),
        },
        select: {
          id: true,
          type: true,
          data: true,
        },
      }),
    ]);

    metadata = {
      publicProducts: publicProducts.map(({ id, licencePlate, name, provider }) => ({
        type: 'product',
        url: `/public-cloud/products/${licencePlate}/billing`,
        id,
        licencePlate,
        name,
        provider,
      })),
      publicRequests: publicCreateRequests.map(({ id, licencePlate, decisionData }) => ({
        type: 'request',
        url: `/public-cloud/requests/${id}/request`,
        id,
        licencePlate,
        name: decisionData.name,
        provider: decisionData.provider,
      })),
      tasks,
    };
  }

  return OkResponse({
    data,
    totalCount,
    metadata,
  });
});
