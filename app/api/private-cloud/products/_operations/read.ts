import { z, TypeOf, ZodType } from 'zod';
import { Session } from 'next-auth';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPathParamSchema } from '../[licencePlate]/schema';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';

export default async function readOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof getPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(product);
}
