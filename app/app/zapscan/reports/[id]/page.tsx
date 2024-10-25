import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { models } from '@/services/db';
import './styles.css';

export default async function Page({ params: paramsProm }: { params: Promise<{ id: string }> }) {
  const params = await paramsProm;
  const session = await getServerSession(authOptions);

  if (!session || !params.id) {
    return null;
  }

  const { data: result } = await models.privateCloudProductZapResult.get(
    {
      where: { id: params.id },
      select: { id: true, html: true },
    },
    session,
  );

  return <div className="zap-report" dangerouslySetInnerHTML={{ __html: result?.html || '' }}></div>;
}
