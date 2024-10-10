import { Session } from 'next-auth';
import { models } from '@/services/db';

export default async function listOp({ session }: { session: Session }) {
  const { data: products } = await models.publicCloudProduct.list(
    {
      where: {},
      skip: 0,
      take: 2,
    },
    session,
  );

  return products;
}
