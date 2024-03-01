import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import prisma from '@/core/prisma';
import './styles.css';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const result = await prisma.privateCloudProjectZapResult.findUnique({
    where: { id: params.id },
    select: { id: true, html: true },
    session: session as never,
  });

  return <div className="zap-report" dangerouslySetInnerHTML={{ __html: result?.html || '' }}></div>;
}
