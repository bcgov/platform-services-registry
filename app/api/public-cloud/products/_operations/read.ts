import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPublicCloudProduct } from '@/queries/public-cloud-products';
import { getPathParamSchema } from '../[licencePlate]/schema';

export default async function readOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof getPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = await getPublicCloudProduct(session, licencePlate);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(product);
}
