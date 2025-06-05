import { z } from 'zod';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { PdfResponse, BadRequestResponse, UnauthorizedResponse } from '@/core/responses';
import { generateEmouPdf } from '@/helpers/pdfs/emou';
import { getPublicCloudBillingResources } from '@/services/db/public-cloud-billing';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  billingId: objectId,
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { billingId } = pathParams;

  const { billingDecorated, productDecorated, request } = await getPublicCloudBillingResources({
    billingId,
    session,
    complete: true,
  });

  if (!billingDecorated) {
    return BadRequestResponse('invalid billing');
  }

  // Case1: product
  if (productDecorated) {
    if (!productDecorated._permissions.downloadMou) {
      return UnauthorizedResponse();
    }

    const buff = await generateEmouPdf(productDecorated, billingDecorated);
    return PdfResponse(buff);
  }

  // Case2: create request
  if (!session.permissions.downloadPublicCloudBillingMou) {
    return UnauthorizedResponse();
  }

  if (!request) {
    return BadRequestResponse('invalid billing');
  }

  const buff = await generateEmouPdf({ ...request.decisionData, archivedAt: null }, billingDecorated);
  return PdfResponse(buff);
});
