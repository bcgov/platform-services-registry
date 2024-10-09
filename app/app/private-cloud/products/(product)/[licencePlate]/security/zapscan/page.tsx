import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import ZapScanResults from '@/components/zapscan/ZapScanResults';
import { authOptions } from '@/core/auth-options';
import { parsePaginationParams } from '@/helpers/pagination';
import { privateCloudProductZapResultModel } from '@/services/db';

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

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const where: Prisma.PrivateCloudProjectZapResultWhereInput = {
    html: { not: null },
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

  const [{ data: rows, totalCount }, { data: distinct }] = await Promise.all([
    privateCloudProductZapResultModel.list(
      {
        where,
        select: {
          id: true,
          licencePlate: true,
          cluster: true,
          host: true,
          json: true,
          scannedAt: true,
          available: true,
        },
        skip,
        take,
        orderBy: [
          {
            scannedAt: Prisma.SortOrder.desc,
          },
          {
            available: Prisma.SortOrder.desc,
          },
        ],
        includeCount: true,
      },
      session,
    ),
    privateCloudProductZapResultModel.list(
      {
        where: { html: { not: null }, licencePlate: params.licencePlate },
        select: { cluster: true },
        distinct: ['cluster'],
      },
      session,
    ),
  ]);

  const clusters = distinct.map((row) => row.cluster);
  return <ZapScanResults rows={rows} clusters={clusters} page={page} skip={skip} take={take} total={totalCount} />;
}
