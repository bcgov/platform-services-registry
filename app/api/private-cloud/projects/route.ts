import { NextRequest, NextResponse } from 'next/server';
import { privateCloudProjectsPaginated } from '@/queries/paginated/private-cloud';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);

  const defaultPageSize = searchParams.get('defaultPageSize');
  const currentPage = searchParams.get('currentPage');
  const search = searchParams.get('search');
  const ministry = searchParams.get('ministry');
  const cluster = searchParams.get('cluster');
  const userEmail = searchParams.get('email');

  if (!defaultPageSize || !currentPage || !search) {
    return new NextResponse('Missing query parameters.', { status: 400 });
  }

  try {
    const data = await privateCloudProjectsPaginated(
      +defaultPageSize,
      +currentPage,
      search,
      ministry,
      cluster,
      userEmail,
    );

    if (!data) {
      return new NextResponse('No data found.', {
        status: 404,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
