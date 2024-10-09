import { Prisma, ProjectContext } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import SonarScanResults from '@/components/sonarscan/SonarScanResults';
import { authOptions } from '@/core/auth-options';
import { parsePaginationParams } from '@/helpers/pagination';
import { sonarScanResultModel } from '@/services/db';

export default async function Page({
  searchParams,
}: {
  searchParams: {
    page: string;
    pageSize: string;
    search: string;
    context: ProjectContext | ProjectContext[];
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

  const where: Prisma.SonarScanResultWhereInput = {};
  if (context.length > 0) {
    where.context = { in: context };
  }

  if (search.length > 0) {
    where.OR = [
      {
        licencePlate: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        url: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [{ data: rows, totalCount }, { data: distinct }] = await Promise.all([
    sonarScanResultModel.list(
      {
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
        includeCount: true,
      },
      session,
    ),
    sonarScanResultModel.list(
      {
        where: {},
        select: { context: true },
        distinct: ['context'],
      },
      session,
    ),
  ]);

  const contexts = distinct.map((row) => row.context);
  return (
    <SonarScanResults rows={rows} contexts={contexts} total={totalCount} page={page} skip={skip} take={take} listAll />
  );
}
