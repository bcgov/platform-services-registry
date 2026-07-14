import { z } from 'zod';
import { getAwsLzaAccountName, publicCloudEnvironmentKeys } from '@/constants/public-cloud';
import createApiHandler from '@/core/api-handler';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { DecisionStatus, Prisma, ProjectStatus, Provider, RequestType } from '@/prisma/client';
import { mergeAwsLzaAccounts } from '@/services/aws-lza/accounts';
import { sendRequestCompletionEmails } from '@/services/ches/public-cloud';
import { models, publicCloudRequestDetailInclude } from '@/services/db';
import { upsertPublicCloudBillings } from '@/services/db/public-cloud-billing';
import { createProductForecast } from '@/services/db/public-cloud-forecast';

const pathParamSchema = z.object({
  idOrLicencePlate: z.string().max(7),
});

const bodySchema = z.object({
  awsAccounts: z
    .array(
      z.object({
        environment: z.enum(publicCloudEnvironmentKeys),
        name: z.string().min(1).optional(),
        accountId: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
});

const apiHandler = createApiHandler({
  roles: ['service-account public-admin'],
  useServiceAccount: true,
  validations: { pathParams: pathParamSchema, body: bodySchema },
});

async function getExistingAwsAccounts(licencePlate: string) {
  const product = await prisma.publicCloudProduct.findUnique({
    where: { licencePlate },
    select: { awsAccounts: true },
  });

  return product?.awsAccounts;
}

export const POST = apiHandler(async ({ pathParams, session, body }) => {
  const { idOrLicencePlate: licencePlate } = pathParams;

  const request = await prisma.publicCloudRequest.findFirst({
    where: {
      decisionStatus: { in: [DecisionStatus.APPROVED, DecisionStatus.AUTO_APPROVED] },
      licencePlate,
      active: true,
    },
    include: {
      decisionData: true,
    },
  });

  if (!request) {
    return NotFoundResponse('No request found for this licece plate.');
  }

  const pendingForecast =
    request.type === RequestType.CREATE && request.pendingForecast && typeof request.pendingForecast === 'object'
      ? (request.pendingForecast as {
          monthlyValues?: { year: number; month: number; amount: number; currency: string }[];
          horizonMonths?: number;
        })
      : null;

  const updateRequest = prisma.publicCloudRequest.update({
    where: {
      id: request.id,
    },
    data: {
      decisionStatus: DecisionStatus.PROVISIONED,
      provisionedDate: new Date(),
      active: false,
      ...(pendingForecast ? { pendingForecast: Prisma.DbNull } : {}),
    },
    include: publicCloudRequestDetailInclude,
  });

  const { id, ...decisionData } = request.decisionData;

  const filter = { licencePlate };
  let awsAccountData = {};

  if (request.type !== RequestType.DELETE && decisionData.provider === Provider.AWS_LZA) {
    const callbackAwsAccounts = body.awsAccounts.map((account) => ({
      ...account,
      name: account.name ?? getAwsLzaAccountName(licencePlate, account.environment),
    }));

    awsAccountData = {
      awsAccounts: mergeAwsLzaAccounts(
        await getExistingAwsAccounts(licencePlate),
        callbackAwsAccounts,
      ) as unknown as Prisma.InputJsonValue,
    };
  }

  const productData = { ...decisionData, ...awsAccountData };

  // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
  const upsertProject =
    request.type === RequestType.DELETE
      ? prisma.publicCloudProduct.update({
          where: filter,
          data: { status: ProjectStatus.INACTIVE },
        })
      : prisma.publicCloudProduct.upsert({
          where: filter,
          update: productData,
          create: productData,
        });

  const [updatedRequest] = await Promise.all([updateRequest, upsertProject]);
  const updatedRequestDecorated = await models.publicCloudRequest.decorate(updatedRequest, session, true);

  if (
    request.type === RequestType.CREATE &&
    pendingForecast?.monthlyValues &&
    pendingForecast.monthlyValues.length > 0
  ) {
    const existingForecast = await prisma.cloudCostForecast.findUnique({ where: { licencePlate } });
    if (!existingForecast) {
      await createProductForecast(licencePlate, pendingForecast.monthlyValues, pendingForecast.horizonMonths ?? 24);
    }
  }

  if (updatedRequestDecorated.type === RequestType.EDIT) {
    if (
      updatedRequestDecorated.originalData?.expenseAuthorityId !==
      updatedRequestDecorated.decisionData.expenseAuthorityId
    ) {
      const lastBilling = await prisma.publicCloudBilling.findFirst({
        select: { accountCoding: true },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      });

      await upsertPublicCloudBillings({
        request: updatedRequestDecorated,
        expenseAuthorityId: updatedRequestDecorated.decisionData.expenseAuthorityId!,
        accountCoding: lastBilling?.accountCoding,
        session,
      });
    }
  }

  await sendRequestCompletionEmails(updatedRequestDecorated);

  const message = `Successfully marked ${licencePlate} as provisioned.`;
  logger.info(message);
  return OkResponse({ success: true, message });
});
