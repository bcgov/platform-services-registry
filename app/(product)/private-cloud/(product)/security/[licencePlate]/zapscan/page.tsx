import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import ZapScanResults from '@/components/zapscan/ZapScanResults';

export default async function Page({
  params,
  searchParams,
}: {
  params: { licencePlate: string };
  searchParams: {
    page: string;
    pageSize: string;
    search: string;
    cluster: string | string[];
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const { page: pageStr, pageSize: pageSizeStr } = searchParams;
  let { search = '', cluster } = searchParams;
  if (!cluster) cluster = [];
  else if (!Array.isArray(cluster)) cluster = [cluster];

  search = search.trim();

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr);

  const where: Prisma.PrivateCloudProjectZapResultWhereInput = {
    html: { not: null },
    json: { not: null },
    licencePlate: params.licencePlate,
  };
  if (cluster.length > 0) {
    where.cluster = { in: cluster };
  }

  if (search.length > 0) {
    where.OR = [
      {
        host: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [rows, distinct, total] = await Promise.all([
    prisma.privateCloudProjectZapResult.findMany({
      where,
      select: { id: true, licencePlate: true, cluster: true, host: true, json: true, scannedAt: true },
      skip,
      take,
      session: session as never,
    }),
    prisma.privateCloudProjectZapResult.findMany({
      where: {},
      select: { cluster: true },
      distinct: ['cluster'],
      session: session as never,
    }),
    prisma.privateCloudProjectZapResult.count({
      where,
      session: session as never,
    }),
  ]);

  const clusters = distinct.map((row) => row.cluster);
  return <ZapScanResults rows={rows} clusters={clusters} page={page} skip={skip} take={take} total={total} />;
}
