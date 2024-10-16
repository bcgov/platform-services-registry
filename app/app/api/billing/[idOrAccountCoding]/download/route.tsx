import { Provider, Cluster, RequestType } from '@prisma/client';
import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { PdfResponse, BadRequestResponse } from '@/core/responses';
import { generateEmouPdf, Product } from '@/helpers/pdfs/emou';
import { processNumber, processUpperEnumString, processBoolean } from '@/utils/zod';
import { getBillingIdWhere } from '../helpers';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const queryParamSchema = z.object({
  licencePlate: z.string().optional(),
  context: z.preprocess(processUpperEnumString, z.union([z.nativeEnum(Provider), z.nativeEnum(Cluster)]).optional()),
});

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.DownloadBillingMou],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { idOrAccountCoding } = pathParams;
  const { licencePlate, context } = queryParams;

  const billingWhereId = getBillingIdWhere(idOrAccountCoding, context);
  const billing = await prisma.billing.findFirst({
    where: { signed: true, approved: true, ...billingWhereId },
    include: {
      signedBy: true,
      approvedBy: true,
      expenseAuthority: true,
    },
  });

  if (!billing) {
    return BadRequestResponse('invalid account coding');
  }

  const targetLicencePlate = licencePlate || billing.licencePlate;

  let product: Product | null = await prisma.publicCloudProject.findFirst({
    where: { licencePlate: targetLicencePlate },
  });

  // Retrieve the product data from the original create request, if the product has not yet been created.
  if (!product) {
    const req = await prisma.publicCloudRequest.findFirst({
      where: { licencePlate: targetLicencePlate, type: RequestType.CREATE },
      include: {
        decisionData: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!req) {
      return BadRequestResponse('invalid account coding');
    }

    product = req.decisionData;
  }

  const buff = await generateEmouPdf(product, billing);
  return PdfResponse(buff);
});
