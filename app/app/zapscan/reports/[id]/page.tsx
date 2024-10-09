import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { privateCloudProductZapResultModel } from '@/services/db';
import './styles.css';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const { data: result } = await privateCloudProductZapResultModel.get(
    {
      where: { id: params.id },
      select: { id: true, html: true },
    },
    session,
  );

  return <div className="zap-report" dangerouslySetInnerHTML={{ __html: result?.html || '' }}></div>;
}
