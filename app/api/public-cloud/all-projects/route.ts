import { NextRequest, NextResponse } from 'next/server';
import { PublicProject } from '@/queries/types';
import { publicCloudProjectsPaginated } from '@/queries/paginated/public-cloud';
import formatDate from '@/utils/date';
import { formatFullName } from '@/helpers/user';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { userInfo } from '@/queries/user';
import { CsvResponse } from '@/core/responses';

const searchParamsSchema = z.object({
  search: z.string().nullable(),
  ministry: z.string().nullable(),
  provider: z.string().nullable(),
  active: z.boolean().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('No session, sending 401');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = req.nextUrl;

    const parsedSearchParams = searchParamsSchema.parse({
      search: searchParams.get('search'),
      ministry: searchParams.get('ministry'),
      provider: searchParams.get('provider'),
      active: searchParams.get('active') === 'true', // Converts 'true' string to true boolean
    });

    const { userEmail, ministryRoles } = userInfo(session.user.email, session.roles);

    const { data } = await publicCloudProjectsPaginated(
      0,
      0,
      parsedSearchParams.search,
      parsedSearchParams.ministry,
      parsedSearchParams.provider,
      userEmail,
      ministryRoles,
      parsedSearchParams.active ?? true,
    );

    if (data.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    // Map the data to the correct format for CSV conversion
    const formattedData = data.map((project: PublicProject) => ({
      name: project.name,
      description: project.description,
      ministry: project.ministry,
      provider: project.provider,
      projectOwnerEmail: project.projectOwner.email,
      projectOwnerName: formatFullName(project.projectOwner),
      primaryTechnicalLeadEmail: project.primaryTechnicalLead.email,
      primaryTechnicalLeadName: formatFullName(project.primaryTechnicalLead),
      secondaryTechnicalLeadEmail: project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
      secondaryTechnicalLeadName: formatFullName(project.secondaryTechnicalLead),
      created: formatDate(project.created.$date),
      updatedAt: formatDate(project.updatedAt?.$date),
      licencePlate: project.licencePlate,
      status: project.status,
    }));

    return CsvResponse(formattedData, 'public-cloud-products.csv');
  } catch (error: any) {
    console.error('Error in handler:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
