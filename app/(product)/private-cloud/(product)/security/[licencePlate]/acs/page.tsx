import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import _lowerCase from 'lodash-es/lowerCase';
import _isArray from 'lodash-es/isArray';
import TableTop from '@/components/table/TableTop';
import prisma from '@/core/prisma';
import Alerts from './Alerts';
import Images from './Images';

export default async function Page({ params }: { params: { licencePlate: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
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
