import { Session } from 'next-auth';
import { publicCloudProductModel } from '@/services/db';

export default async function listOp({ session }: { session: Session }) {
  const { data: products } = await publicCloudProductModel.list(
    {
      where: {},
      skip: 0,
      take: 2,
    },
    session,
  );

  return products;
}
