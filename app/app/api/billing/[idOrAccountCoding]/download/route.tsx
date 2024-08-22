import { Prisma, RequestType } from '@prisma/client';
import ObjectID from 'bson-objectid';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { PdfResponse, BadRequestResponse } from '@/core/responses';
import { WeasyPrint } from '@/services/weasyprint/client';
import { PermissionsEnum } from '@/types/permissions';
import { getBillingIdWhere } from '../helpers';
import BillingMou, { css } from './BillingMou';
import { Product } from './types';

const pathParamSchema = z.object({
  idOrAccountCoding: z.string(),
});

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.DownloadBillingMou],
  validations: { pathParams: pathParamSchema },
});

const weasyClient = new WeasyPrint();

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { idOrAccountCoding } = pathParams;

  const billingWhereId = getBillingIdWhere(idOrAccountCoding);
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

  let product: Product | null = await prisma.publicCloudProject.findFirst({
    where: { licencePlate: billing.licencePlate },
  });

  // Retrieve the product data from the original create request, if the product has not yet been created.
  if (!product) {
    const req = await prisma.publicCloudRequest.findFirst({
      where: { licencePlate: billing.licencePlate, type: RequestType.CREATE },
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

  const ReactDOMServer = (await import('react-dom/server')).default;
  const html = ReactDOMServer.renderToStaticMarkup(<BillingMou product={product} billing={billing} />);
  const buff = await weasyClient.generatePdf({ html, css });

  return PdfResponse(buff);
});
