import { Prisma, $Enums } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import SonarScanResults from '@/components/sonarscan/SonarScanResults';
import { authOptions } from '@/core/auth-options';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';

export default async function Page({
  params,
  searchParams,
}: {
  params: { licencePlate: string };
  searchParams: {
    page: string;
    pageSize: string;
    search: string;
    context: $Enums.ProjectContext | $Enums.ProjectContext[];
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/home');
  }

  const { page: pageStr, pageSize: pageSizeStr } = searchParams;
  let { search = '', context } = searchParams;
  if (!context) context = [];
  else if (!Array.isArray(context)) context = [context];

  search = search.trim();

  const { page, skip, take } = parsePaginationParams(pageStr, pageSizeStr, 10);

  const where: Prisma.SonarScanResultWhereInput = { licencePlate: params.licencePlate };
  if (context.length > 0) {
    where.context = { in: context };
  }

  if (search.length > 0) {
    where.OR = [
      {
        url: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [rows, distinct, total] = await Promise.all([
    prisma.sonarScanResult.findMany({
      where,
      select: {
        id: true,
        licencePlate: true,
        context: true,
        clusterOrProvider: true,
        url: true,
        sha: true,
        source: true,
        result: true,
        scannedAt: true,
      },
      skip,
      take,
      orderBy: [
        {
          scannedAt: Prisma.SortOrder.desc,
        },
      ],
      session: session as never,
    }),
    prisma.sonarScanResult.findMany({
      where: { licencePlate: params.licencePlate },
      select: { context: true },
      distinct: ['context'],
      session: session as never,
    }),
    prisma.sonarScanResult.count({
      where,
      session: session as never,
    }),
  ]);

  const contexts = distinct.map((row) => row.context);
  return <SonarScanResults rows={rows} contexts={contexts} total={total} page={page} skip={skip} take={take} />;
}
