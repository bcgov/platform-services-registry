import { RequestType, TaskStatus, TaskType } from '@prisma/client';
import _uniq from 'lodash-es/uniq';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { models } from '@/services/db/models';
import { searchPublicCloudBillings } from '@/services/db/public-cloud-billing';
import { PublicCloudBillingSearchResponseMetadata } from '@/types/public-cloud';
import { publicCloudBillingSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudBillingSearchBodySchema },
})(async ({ body, session }) => {
  const { includeMetadata } = body;
  let { data, totalCount } = await searchPublicCloudBillings({ ...body, session });

  // If no billing records and user is EA, try fallback access
  if (data.length === 0 && !session.permissions.viewPublicCloudBilling) {
    const eaBillings = await prisma.publicCloudBilling.findMany({
      where: {
        expenseAuthorityId: session.user.id,
        signed: true,
        approved: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        expenseAuthority: true,
        signedBy: true,
        approvedBy: true,
      },
    });

    data = await Promise.all(eaBillings.map((b) => models.publicCloudBilling.decorate(b, session, false)));
    totalCount = data.length;
  }

  let metadata: PublicCloudBillingSearchResponseMetadata = null;
  if (includeMetadata) {
    const licencePlates = _uniq(data.map(({ licencePlate }) => licencePlate));
    let additionalEaLicencePlates: string[] = [];

    if (!session.permissions.viewPublicCloudBilling) {
      const eaBillings = await prisma.publicCloudBilling.findMany({
        where: {
          licencePlate: { notIn: licencePlates },
          expenseAuthorityId: session.user.id,
          signed: true,
          approved: false,
        },
        select: {
          licencePlate: true,
        },
      });

      additionalEaLicencePlates = eaBillings.map((b) => b.licencePlate);
    }

    const licencePlatesWithAccess = _uniq([...licencePlates, ...additionalEaLicencePlates]);

    const [publicProducts, publicCreateRequests, tasks] = await Promise.all([
      prisma.publicCloudProduct.findMany({
        where: { licencePlate: { in: licencePlatesWithAccess } },
        select: { id: true, licencePlate: true, name: true, provider: true },
      }),
      prisma.publicCloudRequest.findMany({
        where: {
          type: RequestType.CREATE,
          licencePlate: { in: licencePlatesWithAccess },
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
          OR: licencePlatesWithAccess.map((licencePlate) => ({
            data: { equals: { licencePlate } },
          })),
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
