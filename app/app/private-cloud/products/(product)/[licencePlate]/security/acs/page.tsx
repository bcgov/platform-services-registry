import _get from 'lodash-es/get';
import _isArray from 'lodash-es/isArray';
import _lowerCase from 'lodash-es/lowerCase';
import _startCase from 'lodash-es/startCase';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import TableTop from '@/components/table/TableTop';
import { authOptions } from '@/core/auth-options';
import prisma from '@/core/prisma';
import Alerts from './Alerts';
import Images from './Images';

export default async function Page({ params: paramsProm }: { params: Promise<{ licencePlate: string }> }) {
  const params = await paramsProm;
  const session = await getServerSession(authOptions);

  if (!params.licencePlate) {
    return null;
  }

  if (!session) {
    redirect('/login?callbackUrl=/home');
  }

  const acs = await prisma.acsResult.findFirst({ where: { licencePlate: params.licencePlate } });

  return (
    <div>
      <div className="border-2 rounded-xl overflow-hidden">
        <div>
          <TableTop title="Red Hat Advanced Cluster Security" description="" />
          <Alerts data={acs?.alerts || []} url={acs?.violationUrl} />
          <div className="my-5" />
          <Images data={acs?.images || []} url={acs?.imageUrl} />
        </div>
      </div>
    </div>
  );
}
