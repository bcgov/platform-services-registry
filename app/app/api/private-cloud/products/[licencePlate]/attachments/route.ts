import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { getProductAttachmentSummary } from '@/services/db/system';

const pathParamsSchema = z.object({
  licencePlate: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const product = await prisma.privateCloudProduct.findUnique({
    where: { licencePlate: pathParams.licencePlate },
    select: { id: true },
  });
  if (!product) return NotFoundResponse('Product not found');
  const res = await getProductAttachmentSummary({ context: 'private', productId: product.id, session });
  return OkResponse(res);
});
